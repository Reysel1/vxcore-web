import { NextRequest, NextResponse } from "next/server";

import { getLicenseByKey, requireHealthyDb } from "@/lib/db";

/**
 * Validación de licencias para la app de escritorio.
 *
 * El instalador se reparte sin coste; el producto se activa con una clave. La
 * app llama aquí con su clave guardada: si la licencia está activa devuelve
 * valid:true; si fue revocada/cancelada, valid:false con reason "revoked" (la
 * app deja de funcionar). No hay secreto que proteger: la clave ES la
 * credencial, igual que en cualquier software con key.
 */
export async function POST(req: NextRequest) {
  let key: unknown;
  try {
    const body = await req.json();
    key = body?.key;
  } catch {
    return NextResponse.json({ valid: false, error: "Cuerpo inválido" }, { status: 400 });
  }

  if (typeof key !== "string" || !key.trim()) {
    return NextResponse.json({ valid: false, error: "Falta la clave" }, { status: 400 });
  }

  try {
    requireHealthyDb();
  } catch (err) {
    console.error("[license] base de datos no disponible:", err);
    return NextResponse.json(
      { valid: false, error: "base-de-datos-no-disponible" },
      { status: 503 }
    );
  }

  const row = getLicenseByKey(key);

  if (!row) {
    return NextResponse.json({ valid: false });
  }
  if (String(row.status) !== "active") {
    return NextResponse.json({ valid: false, reason: "revoked" });
  }

  return NextResponse.json({ valid: true, email: row.user_email });
}
