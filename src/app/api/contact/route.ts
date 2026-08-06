import { NextRequest, NextResponse } from "next/server";

import { addContact } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    company?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Honeypot anti-bots: si está relleno, fingimos éxito pero no guardamos.
  if (body.company) {
    return NextResponse.json({ ok: true });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const subject = body.subject?.trim();
  const message = body.message?.trim();

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Todos los campos son obligatorios." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email no válido." }, { status: 400 });
  }
  if (message.length > 4000 || subject.length > 200 || name.length > 120) {
    return NextResponse.json({ error: "Mensaje demasiado largo." }, { status: 400 });
  }

  addContact({ name, email, subject, message });

  return NextResponse.json({ ok: true });
}
