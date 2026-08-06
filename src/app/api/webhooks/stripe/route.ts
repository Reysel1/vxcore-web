import { NextRequest, NextResponse } from "next/server";

import {
  createLicense,
  ensureUser,
  getActiveLicense,
  getOrderBySessionId,
  markOrderPaid,
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

    // La licencia se genera una sola vez por usuario.
    if (!getActiveLicense(email)) {
      createLicense({ userEmail: email, note: "Generada tras pago con Stripe" });
    }
  }

  return NextResponse.json({ received: true });
}
