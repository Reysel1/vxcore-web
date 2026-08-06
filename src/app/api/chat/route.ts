import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  addMessage,
  listMessages,
  markMessagesRead,
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

  const after = Number(req.nextUrl.searchParams.get("after") ?? 0);
  const filtered = after
    ? messages.filter((m) => Number(m.id) > after)
    : messages;

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

  const created = addMessage({
    userEmail: email,
    sender: "user",
    body: message,
  });

  return NextResponse.json({ message: created });
}
