import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  addMessage,
  getOpenTicket,
  listMessages,
  markMessagesRead,
  requireHealthyDb,
} from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  const email = session?.user?.email;
  if (!session?.user || !email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const messages = listMessages(email);
  // El usuario ya ha visto los mensajes del staff al recibirlos.
  markMessagesRead(email, "staff");

  // ?ticket=<id> limita la conversación a ese ticket (incluye los mensajes
  // legacy sin ticket para no perder historial).
  const ticketId = Number(req.nextUrl.searchParams.get("ticket") ?? 0);
  let filtered = messages;
  if (ticketId > 0) {
    filtered = messages.filter(
      (m) => Number(m.ticket_id) === ticketId || m.ticket_id == null
    );
  }
  const after = Number(req.nextUrl.searchParams.get("after") ?? 0);
  if (after) filtered = filtered.filter((m) => Number(m.id) > after);

  return NextResponse.json({ messages: filtered });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const email = session?.user?.email;
  if (!session?.user || !email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Escribe un mensaje." }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json(
      { error: "El mensaje no puede superar los 2000 caracteres." },
      { status: 400 }
    );
  }

  // Sin base de datos el mensaje se perdería: mejor avisar al usuario.
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

  // Para escribir hace falta un ticket abierto: el chat va por tickets.
  const open = getOpenTicket(email);
  if (!open) {
    return NextResponse.json(
      { error: "Abre un ticket para poder escribir." },
      { status: 400 }
    );
  }

  const created = addMessage({
    userEmail: email,
    sender: "user",
    body: message,
    ticketId: Number(open.id),
  });

  return NextResponse.json({ message: created });
}
