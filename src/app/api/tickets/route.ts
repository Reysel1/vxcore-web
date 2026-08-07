import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { listTicketsForUser } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!session?.user || !email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const tickets = listTicketsForUser(email);
  return NextResponse.json({ tickets });
}
