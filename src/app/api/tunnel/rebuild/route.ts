import { NextRequest, NextResponse } from "next/server";

import {
  deleteTunnel,
  getInstallationOwner,
  getLicenseByKey,
  getTunnel,
  requireHealthyDb,
} from "@/lib/db";

/**
 * Tira el túnel de una instalación para que se cree uno nuevo.
 *
 * El aprovisionamiento es idempotente a propósito: mientras exista la fila, se
 * devuelven las mismas credenciales, y así el agente puede pedirlas mil veces
 * sin dejar túneles colgando en la cuenta.
 *
 * El problema aparece cuando esas credenciales dejan de valer — el túnel se
 * borró en Cloudflare, se rotó el secreto, alguien lo tocó a mano. Entonces el
 * agente reintenta para siempre contra un túnel muerto, el panel dice «no
 * terminó de conectar» y no había forma de salir de ahí: ni el cliente ni el
 * dueño de VXCore tenían un botón. Esto es ese botón.
 *
 * Borra el túnel en Cloudflare, su registro DNS y la fila. La siguiente llamada
 * a /api/tunnel/provision creará uno limpio.
 *
 * Contrato con el agente (agent/src/tunnel.ts):
 *   POST → { key, installationId }
 *        ← 200 { ok: true }
 *        ← 403 licencia no válida, o instalación de otra licencia
 *        ← 503 Cloudflare o la BD fallaron
 */

const INSTALLATION_ID_RE = /^[abcdefghijkmnpqrstuvwxyz23456789]{16}$/;
const CF_API = "https://api.cloudflare.com/client/v4";

export const maxDuration = 30;

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

async function cloudflare(path: string, options: RequestInit = {}) {
  const response = await fetch(`${CF_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env("CF_API_TOKEN")}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    const detail = (data.errors || [])
      .map((e: { code: number; message: string }) => `${e.code}: ${e.message}`)
      .join("; ");
    throw new Error(`Cloudflare ${response.status} en ${path}${detail ? ` — ${detail}` : ""}`);
  }
  return data.result;
}

/**
 * Borra el CNAME del subdominio.
 *
 * Se busca por nombre porque al crearlo no se guardó su id: sin borrarlo, el
 * registro quedaría apuntando a un túnel que ya no existe y el siguiente
 * aprovisionamiento fallaría al intentar crear uno repetido.
 */
async function deleteDnsRecord(hostname: string) {
  const zone = env("CF_ZONE_ID");
  const found = await cloudflare(
    `/zones/${zone}/dns_records?type=CNAME&name=${encodeURIComponent(hostname)}`
  );

  for (const record of Array.isArray(found) ? found : []) {
    await cloudflare(`/zones/${zone}/dns_records/${record.id}`, { method: "DELETE" });
  }
}

export async function POST(req: NextRequest) {
  let key: unknown;
  let installationId: unknown;
  try {
    const body = await req.json();
    key = body?.key;
    installationId = body?.installationId;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  if (typeof key !== "string" || !key.trim()) {
    return NextResponse.json({ error: "Falta la clave" }, { status: 400 });
  }
  if (typeof installationId !== "string" || !INSTALLATION_ID_RE.test(installationId)) {
    return NextResponse.json({ error: "installationId no válido" }, { status: 400 });
  }

  try {
    requireHealthyDb();
  } catch (err) {
    console.error("[tunnel:rebuild] base de datos no disponible:", err);
    return NextResponse.json({ error: "base-de-datos-no-disponible" }, { status: 503 });
  }

  const license = getLicenseByKey(key);
  if (!license || String(license.status) !== "active") {
    return NextResponse.json({ error: "Licencia no válida" }, { status: 403 });
  }
  const licenseKey = String(license.license_key);

  // Mismo control que al aprovisionar: una licencia activa no da derecho a
  // tirarle el túnel a la instalación de otro cliente.
  const owner = getInstallationOwner(installationId);
  if (owner && String(owner.license_key).toLowerCase() !== licenseKey.toLowerCase()) {
    return NextResponse.json(
      { error: "Esta instalación pertenece a otra licencia" },
      { status: 403 }
    );
  }

  const existing = getTunnel(installationId);
  if (!existing) {
    // Nada que rehacer: la siguiente petición ya iba a crear uno. No es un
    // error — el usuario pidió «déjame uno nuevo» y eso es lo que va a tener.
    return NextResponse.json({ ok: true, message: "No había túnel; se creará uno al reconectar." });
  }

  try {
    // Primero el DNS y luego el túnel: al revés, si falla el borrado del túnel
    // el subdominio se queda sin destino y sin registro que borrar después.
    await deleteDnsRecord(String(existing.hostname));
    // Las conexiones primero: Cloudflare se niega a borrar un túnel que aún
    // tenga alguna registrada, y al rehacer el cloudflared del cliente suele
    // seguir vivo. Sin esto el borrado fallaba, la fila se iba igual, y el
    // nombre quedaba ocupado para siempre — que es el 1013 que nos ha traído
    // hasta aquí.
    const account = env("CF_ACCOUNT_ID");
    const tunnelId = String(existing.tunnel_id);

    await cloudflare(`/accounts/${account}/cfd_tunnel/${tunnelId}/connections`, {
      method: "DELETE",
    }).catch(() => {
      // Sin conexiones que limpiar, Cloudflare protesta. No es un problema.
    });

    await cloudflare(`/accounts/${account}/cfd_tunnel/${tunnelId}`, { method: "DELETE" }).catch(
      (error) => {
        // Que ya no esté es el caso que venimos a arreglar y no debe frenar el
        // borrado de la fila. Cualquier otro fallo sí: dejar el túnel vivo y
        // olvidar la fila es justo cómo se crea un huérfano irrecuperable.
        if (String(error).includes("1003") || String(error).includes("404")) {
          console.warn("[tunnel:rebuild] el túnel ya no estaba en Cloudflare:", error);
          return;
        }
        throw error;
      }
    );

    deleteTunnel(installationId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[tunnel:rebuild] fallo rehaciendo:", error);
    return NextResponse.json({ error: "No se pudo rehacer el acceso remoto" }, { status: 503 });
  }
}
