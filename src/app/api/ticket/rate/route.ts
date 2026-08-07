import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { getTicketById, rateTicket, requireHealthyDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  const email = session?.user?.email;
  if (!session?.user || !email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: { ticketId?: unknown; rating?: unknown; comment?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const ticketId = Number(body.ticketId);
  const rating = Number(body.rating);
  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return NextResponse.json({ error: "Ticket no válido." }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "La valoración debe ser entre 1 y 5 estrellas." },
      { status: 400 }
    );
  }
  const comment =
    typeof body.comment === "string"
      ? body.comment.trim().slice(0, 500) || null
      : null;

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

  const ticket = getTicketById(ticketId, email);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket no encontrado." }, { status: 404 });
  }
  if (ticket.status !== "closed") {
    return NextResponse.json(
      { error: "Solo puedes valorar un ticket cerrado." },
      { status: 400 }
    );
  }
  if (ticket.rated_at) {
    return NextResponse.json(
      { error: "Ya valoraste este ticket." },
      { status: 400 }
    );
  }

  rateTicket(ticketId, rating, comment);
  const updated = getTicketById(ticketId, email);
  return NextResponse.json({ ticket: updated ?? ticket });
}
