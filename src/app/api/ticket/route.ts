import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  createTicket,
  getOpenTicket,
  getUserTicket,
  requireHealthyDb,
} from "@/lib/db";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!session?.user || !email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const ticket = getUserTicket(email) ?? null;
  return NextResponse.json({ ticket });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const email = session?.user?.email;
  if (!session?.user || !email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: { subject?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const subject = (body.subject ?? "").trim().slice(0, 120) || null;

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

  const existing = getOpenTicket(email);
  if (existing) {
    return NextResponse.json(
      { error: "Ya tienes un ticket abierto.", ticket: existing },
      { status: 409 }
    );
  }

  const ticket = createTicket({ userEmail: email, subject });
  return NextResponse.json({ ticket }, { status: 201 });
}
