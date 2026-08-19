import { NextRequest, NextResponse } from "next/server";

import { getLicenseByKey, requireHealthyDb, touchInstallation } from "@/lib/db";

/** Mismo formato que genera el agente (agent/src/installation.ts). */
const INSTALLATION_ID_RE = /^[abcdefghijkmnpqrstuvwxyz23456789]{16}$/;

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
  let installationId: unknown;
  let installationName: unknown;
  try {
    const body = await req.json();
    key = body?.key;
    installationId = body?.installationId;
    installationName = body?.installationName;
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

  // Sólo se registra el equipo cuando la licencia es válida: si no, cualquiera
  // podría llenar la tabla probando claves inventadas.
  //
  // Un fallo aquí no puede tumbar la validación — dejar una app pagada sin
  // arrancar por no poder anotar estadísticas sería absurdo.
  if (typeof installationId === "string" && INSTALLATION_ID_RE.test(installationId)) {
    try {
      const result = touchInstallation({
        id: installationId,
        licenseKey: String(row.license_key),
        name: typeof installationName === "string" ? installationName.slice(0, 60) : null,
      });

      // El equipo ya es de otro cliente y no se le reasigna. No cambia la
      // respuesta —su clave es válida y lo sigue siendo— pero queda anotado:
      // si no es un intento de quedarse con la instalación de otro, es alguien
      // que restauró un backup ajeno o clonó una máquina entera, y las tres
      // cosas se ven igual desde aquí.
      if (result === "rejected") {
        console.warn(
          `[license] ${installationId} responde a otra licencia; no se reasigna a ${row.license_key}.`
        );
      }
    } catch (err) {
      console.error("[license] no se pudo registrar la instalación:", err);
    }
  }

  return NextResponse.json({ valid: true, email: row.user_email });
}
