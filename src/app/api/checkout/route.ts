import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  createOrder,
  deleteOrder,
  ensureUser,
  requireHealthyDb,
  updateOrderSession,
} from "@/lib/db";
import { getPriceId, getStripe, isStripeConfigured } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  const email = session?.user?.email;

  if (!session?.user || !email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Stripe aún no está configurado. Falta STRIPE_SECRET_KEY, STRIPE_PRICE_ID o STRIPE_WEBHOOK_SECRET.",
      },
      { status: 500 }
    );
  }

  // Si la base de datos no está disponible (p. ej. falta Turso en Vercel),
  // no dejamos que el pago avance: el pedido no podría registrarse.
  try {
    requireHealthyDb();
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "La base de datos no está disponible.",
      },
      { status: 503 }
    );
  }

  ensureUser({
    email,
    name: session.user.name,
    image: session.user.image,
    provider: session.user.provider,
  });

  const planName = process.env.STRIPE_PLAN_NAME ?? "Pro";
  const order = createOrder({
    userEmail: email,
    userName: session.user.name,
    planName,
  });

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    req.headers.get("origin") ??
    "http://localhost:3000";

  try {
    const stripe = getStripe();
    const checkout = await stripe.checkout.sessions.create({
      // El precio del plan es recurrente (27 €/mes, que es lo que anuncia la
      // web). Con `payment` Stripe rechaza la sesión —«You specified `payment`
      // mode but passed a recurring price»— y el catch de abajo lo tapaba con
      // un «no se pudo iniciar el pago» que no decía nada.
      mode: "subscription",
      line_items: [{ price: getPriceId()!, quantity: 1 }],
      customer_email: email,
      client_reference_id: email,
      metadata: { orderId: String(order.id) },
      success_url: `${origin}/dashboard?success=1`,
      cancel_url: `${origin}/dashboard?canceled=1`,
      allow_promotion_codes: true,
    });

    updateOrderSession(Number(order.id), checkout.id);
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("[checkout] error:", err);
    // Si Stripe falla, no dejamos un pedido huérfano en "pending".
    try {
      deleteOrder(Number(order.id));
    } catch {
      /* noop */
    }
    return NextResponse.json(
      { error: "No se pudo iniciar el pago. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
