import { NextRequest, NextResponse } from "next/server";

import {
  createLicense,
  ensureUser,
  getActiveLicense,
  getOrderBySessionId,
  markOrderPaid,
  requireHealthyDb,
  setLicenseStatus,
} from "@/lib/db";
import { getStripe } from "@/lib/stripe";

/**
 * Email del cliente a partir de su id de Stripe.
 *
 * Los eventos de suscripción no traen el email, solo `customer`, así que hay
 * que preguntárselo a Stripe. Devuelve null si el cliente fue borrado.
 */
async function emailForCustomer(customerId: string): Promise<string | null> {
  try {
    const customer = await getStripe().customers.retrieve(customerId);
    if (customer.deleted) return null;
    return customer.email ?? null;
  } catch (err) {
    console.error("[webhook] no se pudo resolver el cliente:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET no configurada" },
      { status: 500 }
    );
  }

  // Sin base de datos el webhook no puede registrar el pago ni emitir la
  // licencia. Devolvemos 500 para que Stripe reintente cuando esté arreglado.
  try {
    requireHealthyDb();
  } catch (err) {
    console.error("[webhook] base de datos no disponible:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "La base de datos no está disponible.",
      },
      { status: 500 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature ?? "", secret);
  } catch (err) {
    console.error("[webhook] firma inválida:", err);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const cs = event.data.object as {
      id: string;
      customer_email?: string | null;
      client_reference_id?: string | null;
      customer?: string | null;
      payment_intent?: string | null;
      amount_total?: number | null;
      currency?: string | null;
      metadata?: { orderId?: string } | null;
    };

    const email = cs.customer_email ?? cs.client_reference_id;
    if (!email) {
      return NextResponse.json({ received: true, skipped: "sin email" });
    }

    ensureUser({ email });

    const orderId = cs.metadata?.orderId
      ? Number(cs.metadata.orderId)
      : getOrderBySessionId(cs.id)?.id;

    if (orderId) {
      const existing = getOrderBySessionId(cs.id);
      // Idempotente: si Stripe reintenta el evento, no volvemos a tocar el pedido.
      if (existing?.status !== "paid") {
        markOrderPaid(Number(orderId), {
          sessionId: cs.id,
          customerId: cs.customer,
          paymentIntent: cs.payment_intent,
          amountCents: cs.amount_total ?? null,
          currency: cs.currency ?? "eur",
        });
      }
    }

    // La licencia se genera una sola vez por usuario. El índice único parcial
    // (idx_licenses_one_active) hace la comprobación atómica: si dos entregas
    // del evento llegan a la vez, solo una crea la licencia y la otra recibe el
    // error de constraint, que aquí se trata como "ya existe" (no como fallo).
    if (!getActiveLicense(email)) {
      try {
        createLicense({ userEmail: email, note: "Generada tras pago con Stripe" });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (!/unique|constraint/i.test(message)) {
          throw err; // error real de BD → 500 → Stripe reintenta
        }
        console.warn("[webhook] licencia ya existente (evento duplicado), se omite.");
      }
    }
  }

  // El plan es una suscripción y la web promete «cancela cuando quieras». Sin
  // esto, cancelar dejaba la licencia activa para siempre: se cobraba una vez y
  // el acceso no se retiraba nunca. Stripe manda este evento cuando la
  // suscripción termina de verdad (al acabar el periodo ya pagado), no al
  // pedir la baja, así que el usuario conserva lo que pagó.
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as { customer?: string | null };
    const customerId = subscription.customer;

    if (typeof customerId === "string") {
      const email = await emailForCustomer(customerId);
      if (email) {
        const license = getActiveLicense(email);
        if (license) {
          setLicenseStatus(Number(license.id), "revoked");
          console.log(`[webhook] licencia revocada por baja de suscripción: ${email}`);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
