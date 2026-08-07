import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  closeTicket,
  getOpenTicket,
  getTicketById,
  requireHealthyDb,
} from "@/lib/db";

export async function POST() {
  const session = await auth();
  const email = session?.user?.email;
  if (!session?.user || !email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

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

  const open = getOpenTicket(email);
  if (!open) {
    return NextResponse.json(
      { error: "No tienes ningún ticket abierto." },
      { status: 404 }
    );
  }

  closeTicket(Number(open.id));
  // Devolvemos la fila recién cerrada (status = 'closed'), no la antigua.
  const ticket = getTicketById(Number(open.id), email) ?? open;
  return NextResponse.json({ ticket });
}
