import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

import {
  getInstallationOwner,
  getLicenseByKey,
  getTunnel,
  requireHealthyDb,
  saveTunnel,
} from "@/lib/db";

/**
 * Aprovisionamiento del acceso remoto de la app de escritorio.
 *
 * El agente vive detrás del router del cliente y no tiene dirección pública.
 * En vez de pedirle que abra puertos —cosa que la mitad no sabe hacer y la otra
 * mitad haría mal, dejando su FXServer a la intemperie— el agente levanta un
 * túnel de Cloudflare hacia fuera y su panel queda en <id>.reylab.cloud.
 *
 * Este endpoint es el único sitio donde vive CF_API_TOKEN, y esa es toda su
 * razón de ser: ese token crea y borra túneles y mueve el DNS de la cuenta
 * entera. Puesto en el agente, cualquiera que descargue el instalador lo saca.
 *
 * Contrato con el agente (agent/src/tunnel.ts del repo de la app):
 *   POST → { key, installationId, installationName }
 *        ← 200 { hostname, tunnelId, accountTag, tunnelSecret }
 *        ← 403 licencia no válida, o instalación de otra licencia
 *        ← 503 Cloudflare o la BD fallaron (el agente reintenta con espera)
 */

/** Mismo formato que genera el agente (agent/src/installation.ts). */
const INSTALLATION_ID_RE = /^[abcdefghijkmnpqrstuvwxyz23456789]{16}$/;

const CF_API = "https://api.cloudflare.com/client/v4";

// Son dos llamadas a Cloudflare; con el límite por defecto va justo si su API
// se pone lenta. Bájalo a 10 si tu plan no admite 30.
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
    // El detalle se queda en los logs: distingue "ya existe" de "token sin
    // permisos", que se arreglan de formas muy distintas. No sale hacia el
    // agente porque los mensajes de Cloudflare llevan ids de cuenta y zona.
    const detail = (data.errors || [])
      .map((e: { code: number; message: string }) => `${e.code}: ${e.message}`)
      .join("; ");
    throw new Error(`Cloudflare ${response.status} en ${path}${detail ? ` — ${detail}` : ""}`);
  }
  return data.result;
}

/**
 * Crea el túnel.
 *
 * `config_src: "local"` no es un detalle: significa que las reglas de rutas las
 * escribe el agente en su propio fichero, no el panel de Cloudflare. Tiene que
 * ser así porque los puertos del panel y del agente cambian entre arranques
 * —la app de escritorio los mueve si están ocupados— y desde aquí no hay forma
 * de saber en cuáles han quedado.
 */
/**
 * Borra los túneles que ya existan con ese nombre.
 *
 * Cloudflare no deja dos túneles con el mismo nombre en una cuenta: responde
 * 1013 y el aprovisionamiento entero se cae. Y el nombre lo derivamos del id de
 * instalación, así que si por lo que sea queda uno colgado —un rehacer que no
 * llegó a completarse, un borrado que Cloudflare rechazó— esa instalación no
 * puede volver a tener túnel NUNCA. Es un callejón sin salida permanente, y en
 * casa de un cliente no hay quien lo saque de ahí.
 *
 * Las conexiones se limpian antes: Cloudflare se niega a borrar un túnel que
 * todavía tiene alguna registrada, que es justo lo que pasa cuando el
 * cloudflared del cliente sigue vivo mientras se rehace.
 */
async function removeTunnelsNamed(name: string) {
  const account = env("CF_ACCOUNT_ID");
  const existing = await cloudflare(
    `/accounts/${account}/cfd_tunnel?is_deleted=false&name=${encodeURIComponent(name)}`
  );

  for (const tunnel of Array.isArray(existing) ? existing : []) {
    await cloudflare(`/accounts/${account}/cfd_tunnel/${tunnel.id}/connections`, {
      method: "DELETE",
    }).catch(() => {
      // Sin conexiones que limpiar, Cloudflare protesta. No es un problema.
    });
    await cloudflare(`/accounts/${account}/cfd_tunnel/${tunnel.id}`, { method: "DELETE" });
  }
}

async function createTunnel(name: string) {
  // 32 bytes es lo que espera cloudflared, en base64 porque así viaja igual a
  // la API y al fichero de credenciales del agente.
  const tunnelSecret = randomBytes(32).toString("base64");
  const body = JSON.stringify({ name, tunnel_secret: tunnelSecret, config_src: "local" });

  try {
    const tunnel = await cloudflare(`/accounts/${env("CF_ACCOUNT_ID")}/cfd_tunnel`, {
      method: "POST",
      body,
    });
    return { tunnelId: String(tunnel.id), tunnelSecret };
  } catch (error) {
    // 1013 = ya hay uno con ese nombre. Es recuperable y hay que recuperarlo:
    // el secreto del viejo no se puede volver a leer, así que la única salida
    // es borrarlo y crear otro.
    if (!String(error).includes("1013")) throw error;

    console.warn(`[tunnel] ya existía un túnel llamado ${name}; se borra y se rehace.`);
    await removeTunnelsNamed(name);

    const tunnel = await cloudflare(`/accounts/${env("CF_ACCOUNT_ID")}/cfd_tunnel`, {
      method: "POST",
      body,
    });
    return { tunnelId: String(tunnel.id), tunnelSecret };
  }
}

/**
 * Apunta <id>.<dominio> al túnel.
 *
 * `proxied: true` es obligatorio aquí: un CNAME a `cfargotunnel.com` sin proxy
 * no resuelve a nada, y es además lo que pone el HTTPS. (Es lo contrario de lo
 * que quieres en los registros de correo y de la web, que van en gris; aquí el
 * proxy es el mecanismo, no un extra.)
 */
async function createDnsRecord(subdomain: string, tunnelId: string) {
  const zone = env("CF_ZONE_ID");
  const body = JSON.stringify({
    type: "CNAME",
    name: subdomain,
    content: `${tunnelId}.cfargotunnel.com`,
    proxied: true,
    comment: "VXCore — acceso remoto del panel",
  });

  try {
    await cloudflare(`/zones/${zone}/dns_records`, { method: "POST", body });
  } catch (error) {
    // 81053 = ya hay un registro con ese nombre. Mismo callejón sin salida que
    // con el túnel: un CNAME huérfano apuntando a un túnel que ya no existe
    // dejaría a esa instalación sin poder publicarse nunca más. Se reemplaza.
    if (!String(error).includes("81053")) throw error;

    console.warn(`[tunnel] ya existía un CNAME para ${subdomain}; se reemplaza.`);
    const stale = await cloudflare(
      `/zones/${zone}/dns_records?type=CNAME&name=${encodeURIComponent(subdomain)}`
    );
    for (const record of Array.isArray(stale) ? stale : []) {
      await cloudflare(`/zones/${zone}/dns_records/${record.id}`, { method: "DELETE" });
    }

    await cloudflare(`/zones/${zone}/dns_records`, { method: "POST", body });
  }
}

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
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  if (typeof key !== "string" || !key.trim()) {
    return NextResponse.json({ error: "Falta la clave" }, { status: 400 });
  }
  // El id acaba dentro de un nombre DNS: se valida con el formato con que lo
  // genera el agente en vez de confiar en lo que llega.
  if (typeof installationId !== "string" || !INSTALLATION_ID_RE.test(installationId)) {
    return NextResponse.json({ error: "installationId no válido" }, { status: 400 });
  }

  try {
    requireHealthyDb();
  } catch (err) {
    console.error("[tunnel] base de datos no disponible:", err);
    return NextResponse.json({ error: "base-de-datos-no-disponible" }, { status: 503 });
  }

  // La licencia es lo único que demuestra que quien pregunta es un cliente: el
  // installationId se lo inventa cualquiera.
  const license = getLicenseByKey(key);
  if (!license || String(license.status) !== "active") {
    return NextResponse.json({ error: "Licencia no válida" }, { status: 403 });
  }
  const licenseKey = String(license.license_key);

  try {
    // De quién es este equipo. Se comprueba ANTES de tocar nada suyo, y ese
    // orden es la corrección: la respuesta idempotente iba primero, así que
    // bastaba con nombrar el installationId de otro cliente para que este
    // endpoint devolviera su `tunnelSecret`. Y el installationId no es
    // ningún secreto — es su propio subdominio, lo conoce cualquiera a quien
    // le haya pasado el enlace de su panel, empezando por su propio staff.
    // Con ese secreto se levanta SU túnel desde otra máquina: a partir de ahí
    // Cloudflare reparte el tráfico de su panel entre las dos, y el que
    // conteste recibe las sesiones de sus colaboradores.
    //
    // Manda la fila de la instalación: dice a qué licencia responde ese equipo
    // HOY, y reasignarla ya está controlado en `touchInstallation`. La del
    // túnel sólo entra cuando no hay instalación registrada, para que una fila
    // de túnel suelta no quede sin dueño y la conteste cualquiera.
    //
    // Y en ese orden, no exigiendo las dos: la licencia del túnel es la de
    // cuando se creó, así que quien renueva con una clave nueva acabaría sin
    // poder pedir su propio túnel — el mismo cliente, la misma máquina, la
    // puerta cerrada por una fila vieja.
    const owner = getInstallationOwner(installationId);
    const existing = getTunnel(installationId);

    const authority = owner?.license_key ?? existing?.license_key;
    if (authority && String(authority).toLowerCase() !== licenseKey.toLowerCase()) {
      return NextResponse.json(
        { error: "Esta instalación pertenece a otra licencia" },
        { status: 403 }
      );
    }

    // Idempotencia: si ya tiene túnel, se devuelve el mismo. Crear otro dejaría
    // el anterior colgando en la cuenta y el DNS apuntando al que ya no se usa.
    if (existing) {
      return NextResponse.json({
        hostname: String(existing.hostname),
        tunnelId: String(existing.tunnel_id),
        accountTag: env("CF_ACCOUNT_ID"),
        tunnelSecret: String(existing.tunnel_secret),
      });
    }

    const hostname = `${installationId}.${env("VX_TUNNEL_DOMAIN")}`;
    const { tunnelId, tunnelSecret } = await createTunnel(`vxcore-${installationId}`);

    try {
      await createDnsRecord(installationId, tunnelId);
    } catch (error) {
      // El túnel ya existe pero se quedó sin nombre: sin deshacerlo, cada
      // reintento del agente dejaría uno más tirado en la cuenta.
      await cloudflare(`/accounts/${env("CF_ACCOUNT_ID")}/cfd_tunnel/${tunnelId}`, {
        method: "DELETE",
      }).catch(() => {});
      throw error;
    }

    saveTunnel({
      installationId,
      installationName:
        typeof installationName === "string" ? installationName.slice(0, 60) : null,
      licenseKey,
      hostname,
      tunnelId,
      tunnelSecret,
    });

    return NextResponse.json({
      hostname,
      tunnelId,
      accountTag: env("CF_ACCOUNT_ID"),
      tunnelSecret,
    });
  } catch (error) {
    console.error("[tunnel] fallo aprovisionando:", error);
    return NextResponse.json({ error: "No se pudo preparar el acceso remoto" }, { status: 503 });
  }
}
