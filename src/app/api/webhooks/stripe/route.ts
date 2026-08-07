import { NextRequest, NextResponse } from "next/server";

import {
  createLicense,
  ensureUser,
  getActiveLicense,
  getOrderBySessionId,
  markOrderPaid,
  requireHealthyDb,
} from "@/lib/db";
import { getStripe } from "@/lib/stripe";

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

  return NextResponse.json({ received: true });
}
