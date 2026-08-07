#!/usr/bin/env node
/**
 * Verificador del sistema VXCore.
 *
 * Comprueba de una vez:
 *   1. La web desplegada (landing, base de datos Turso, auth/NextAuth,
 *      callbacks de Google/Discord, /dashboard, webhook de Stripe).
 *   2. El admin (URL configurable; por defecto localhost:3100 y admin.reylab.cloud).
 *   3. El agente (opcional; por defecto https://agent.reylab.cloud).
 *   4. La configuración LOCAL del admin (valida el .env.local y prueba la
 *      conexión real a Turso).
 *
 * Sin dependencias: usa fetch de Node 18+.
 *
 * Uso:
 *   node scripts/verificar-sistema.mjs [--web URL] [--admin URL] [--agent URL] [--no-color]
 *
 * Variables de entorno:
 *   ADMIN_ENV_FILE  → ruta al .env.local del admin (por defecto busca junto al proyecto)
 */

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

const args = process.argv.slice(2);
const arg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const has = (name) => args.includes(name);

const COLOR = !has("--no-color") && process.env.NO_COLOR === undefined;
const paint = (code, s) => (COLOR ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = (s) => paint("32", s);
const red = (s) => paint("31", s);
const yellow = (s) => paint("33", s);
const cyan = (s) => paint("36", s);
const bold = (s) => paint("1", s);
const ok = (s) => console.log(`  ${green("✅")} ${s}`);
const warn = (s) => console.log(`  ${yellow("⚠️")} ${s}`);
const fail = (s) => console.log(`  ${red("❌")} ${s}`);
const info = (s) => console.log(`  ${cyan("ℹ️")} ${s}`);

const TIMEOUT = 15000;

async function fetchText(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT),
    redirect: "manual",
  });
  const body = await res.text().catch(() => "");
  return { status: res.status, body };
}

const PENDIENTES = [];
const pendiente = (s) => PENDIENTES.push(`  ${red("•")} ${s}`);

async function probe(label, fn) {
  try {
    return await fn();
  } catch (err) {
    fail(`${label} — no se pudo conectar (${err?.cause?.code || err?.message || err})`);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Configuración                                                       */
/* ------------------------------------------------------------------ */

const WEB = (arg("--web", process.env.WEB_URL || "https://vxcore.reylab.cloud")).replace(/\/+$/, "");
const ADMIN = (arg("--admin", process.env.ADMIN_URL || "")).replace(/\/+$/, "");
const AGENT = (arg("--agent", process.env.AGENT_URL || "https://agent.reylab.cloud")).replace(/\/+$/, "");

console.log(bold("\n═══════════════════════════════════════════════"));
console.log(bold("  VERIFICADOR DEL SISTEMA VXCore"));
console.log(bold("═══════════════════════════════════════════════"));
console.log(`  Web:   ${cyan(WEB)}`);
console.log(`  Admin: ${cyan(ADMIN || "(auto: localhost:3100 / admin.reylab.cloud)")}`);
console.log(`  Agente:${cyan(AGENT)}`);
console.log("");

/* ------------------------------------------------------------------ */
/* 1. Web — landing                                                    */
/* ------------------------------------------------------------------ */

console.log(bold("\n── 1. WEB — ¿está arriba? ──"));
const landing = await probe("Landing", () => fetchText(`${WEB}/`));
if (landing) {
  if (landing.status === 200) ok(`Landing responde (HTTP 200)`);
  else {
    fail(`Landing devuelve HTTP ${landing.status}`);
    pendiente(`La web no responde 200 en ${WEB}`);
  }
} else {
  pendiente(`No se pudo conectar con la web en ${WEB}`);
}

/* ------------------------------------------------------------------ */
/* 2. Web — base de datos (Turso) y webhook de Stripe                  */
/* ------------------------------------------------------------------ */

console.log(bold("\n── 2. WEB — base de datos (Turso) y Stripe ──"));

// POST vacío al webhook: sin firma. Según el estado devuelve señales distintas:
//  - "Firma inválida"                 → secret configurado Y BD funciona ✅
//  - "STRIPE_WEBHOOK_SECRET no configurada" → falta el secret → probamos BD con /api/contact
//  - mensaje de BD                     → la BD (Turso) no está configurada
let dbOk = false;
const wh = await probe("Webhook", () =>
  fetchText(`${WEB}/api/webhooks/stripe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  })
);
if (wh) {
  if (wh.body.includes("Firma inválida")) {
    ok("Base de datos (Turso) funcionando + STRIPE_WEBHOOK_SECRET configurado");
    dbOk = true;
  } else if (wh.body.includes("STRIPE_WEBHOOK_SECRET no configurada")) {
    fail("STRIPE_WEBHOOK_SECRET NO está configurada en Vercel (web)");
    pendiente(`Añade STRIPE_WEBHOOK_SECRET en Vercel → proyecto web → Environment Variables`);
  } else if (wh.body.includes("Base de datos no disponible") || wh.body.includes("ENOENT") || wh.body.includes("JWT")) {
    fail(`Base de datos NO configurada: ${wh.body.slice(0, 160)}`);
    pendiente(
      `Añade TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en Vercel → proyecto web → Environment Variables → redeploy`
    );
  } else {
    warn(`Webhook respondió HTTP ${wh.status} (respuesta inesperada: ${wh.body.slice(0, 120)})`);
  }
}

// Solo si el webhook fue inconcluso (no respondió, o falta el secret de Stripe)
// probamos la BD con /api/contact. Si el webhook ya dijo que la BD está rota,
// no hace falta escribir nada.
const webhookInconclusive = wh === null || (wh && wh.body.includes("STRIPE_WEBHOOK_SECRET no configurada"));
if (webhookInconclusive && !dbOk) {
  const ct = await probe("BD (contact)", () =>
    fetchText(`${WEB}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "VERIFICADOR",
        email: "verificar@vxcore.dev",
        subject: "prueba automatica",
        message: "Fila generada por verificar-sistema.mjs — puedes borrarla en el admin (Contactos).",
      }),
    })
  );
  if (ct) {
    if (ct.status === 200 && ct.body.includes('"ok"')) {
      ok("Base de datos (Turso) funcionando (se creó 1 fila de prueba «verificar@vxcore.dev» — bórrala en el admin)");
      dbOk = true;
    } else {
      fail(`Base de datos NO disponible: ${ct.body.slice(0, 200)}`);
      pendiente(`Añade TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en Vercel → proyecto web → redeploy`);
    }
  }
}

/* ------------------------------------------------------------------ */
/* 3. Web — auth (NextAuth) y callbacks                                */
/* ------------------------------------------------------------------ */

console.log(bold("\n── 3. WEB — login (NextAuth / Google / Discord) ──"));

const sess = await probe("Session", () => fetchText(`${WEB}/api/auth/session`));
if (sess) {
  if (sess.status === 200) {
    ok("NextAuth funciona (session HTTP 200)");
  } else {
    fail(`NextAuth NO funciona (session HTTP ${sess.status})`);
    pendiente(
      `El login está roto. Tras desplegar el fix trustHost: si sigue, regenera AUTH_SECRET (` +
        `openssl rand -base64 32` +
        `) sin comillas ni saltos de línea, ponlo en Vercel → proyecto web, y redeployea`
    );
  }
}

const provs = await probe("Providers", () => fetchText(`${WEB}/api/auth/providers`));
if (provs && provs.status === 200 && provs.body.includes("google")) {
  ok("Google y Discord configurados como proveedores");
  try {
    const data = JSON.parse(provs.body);
    const origin = new URL(WEB).origin;
    for (const p of ["google", "discord"]) {
      const cb = data[p]?.callbackUrl;
      if (cb) {
        const hostOk = cb.startsWith(origin);
        if (hostOk) {
          ok(`Callback ${p}: ${cb}`);
        } else {
          fail(`Callback de ${p} apunta a ${cb} (¡debería ser ${origin}!) — revisa AUTH_URL / NEXTAUTH_URL en Vercel`);
          pendiente(`Corrige AUTH_URL/NEXTAUTH_URL en Vercel (web): no debe apuntar a localhost`);
        }
      }
    }
    info(
      `Registra en los portales las URIs exactas:\n` +
        `     Google  → ${origin}/api/auth/callback/google\n` +
        `     Discord → ${origin}/api/auth/callback/discord`
    );
  } catch {
    warn("No se pudo interpretar la respuesta de /api/auth/providers");
  }
} else if (provs && provs.status === 200) {
  fail("El endpoint de providers no muestra Google/Discord configurados");
  pendiente("Revisa AUTH_GOOGLE_ID/SECRET y AUTH_DISCORD_ID/SECRET en Vercel (web)");
} else if (provs) {
  fail(`/api/auth/providers → HTTP ${provs.status} (NextAuth roto)`);
}

/* ------------------------------------------------------------------ */
/* 4. Web — /dashboard                                                 */
/* ------------------------------------------------------------------ */

console.log(bold("\n── 4. WEB — /dashboard ──"));
const dash = await probe("Dashboard", () => fetchText(`${WEB}/dashboard`));
if (dash) {
  if (dash.status === 200 || dash.status === 307 || dash.status === 302) {
    ok(`/dashboard responde HTTP ${dash.status} (sin sesión redirige al login — correcto)`);
  } else {
    fail(`/dashboard → HTTP ${dash.status}`);
    pendiente(`/dashboard da error: suele ser la BD (Turso) o NextAuth en Vercel (web)`);
  }
}

/* ------------------------------------------------------------------ */
/* 5. Admin                                                            */
/* ------------------------------------------------------------------ */

console.log(bold("\n── 5. ADMIN ──"));
const adminUrls = ADMIN
  ? [ADMIN]
  : ["http://localhost:3100", "https://admin.reylab.cloud", "https://vxcore-admin.vercel.app"];

let adminUp = false;
for (const url of adminUrls) {
  const r = await probe(`Admin ${url}`, () => fetchText(url));
  if (!r) continue;
  if (r.status === 200 || r.status === 307 || r.status === 302 || r.status === 401) {
    ok(`Admin responde: ${url} (HTTP ${r.status})`);
    adminUp = true;
    if (url.includes("localhost")) {
      warn(
        `El admin local (3100) corre desde la carpeta «VXCore Admin» SIN .env.local. ` +
          `Para Turso usa la carpeta «vxcore-admin» (con .env.local) o corrígelo.`
      );
    }
    break;
  }
  fail(`Admin ${url} respondió con HTTP ${r.status} (inesperado)`);
}
if (!adminUp) {
  pendiente("Admin no encontrado: arranca el local (vxcore-admin) o despliega admin.reylab.cloud");
}

/* ------------------------------------------------------------------ */
/* 6. Agente (opcional)                                                */
/* ------------------------------------------------------------------ */

console.log(bold("\n── 6. AGENTE (panel FiveOS) ──"));
const ag = await probe("Agente", () => fetchText(`${AGENT}/api/health`));
if (ag && (ag.status === 200 || ag.body.includes("Agent is running"))) {
  ok(`Agente responde en ${AGENT}`);
} else {
  warn(`Agente no accesible en ${AGENT} — normal si usas el .exe local o aún no hay túnel`);
}

/* ------------------------------------------------------------------ */
/* 7. Configuración LOCAL del admin                                    */
/* ------------------------------------------------------------------ */

console.log(bold("\n── 7. CONFIG LOCAL DEL ADMIN (.env.local) ──"));
const { existsSync, readFileSync } = await import("node:fs");
const path = await import("node:path");
const { fileURLToPath } = await import("node:url");
// fileURLToPath decodifica %20/acentos: sin él, la carpeta «VXCore Admin» (con
// espacio) nunca se encontraría.
const here = path.dirname(fileURLToPath(import.meta.url));

const envCandidates = [
  process.env.ADMIN_ENV_FILE,
  path.join(here, "..", "..", "vxcore-admin", ".env.local"),
  path.join(here, "..", "..", "VXCore Admin", ".env.local"),
].filter(Boolean);

let envFile = envCandidates.find((f) => existsSync(f));
if (!envFile) {
  warn("No se encontró ningún .env.local del admin (¿ADMIN_ENV_FILE?)");
} else {
  info(`Leyendo ${envFile}`);
  const raw = readFileSync(envFile, "utf8");
  const get = (k) => {
    const m = raw.match(new RegExp(`^${k}\\s*=\\s*(.*)$`, "m"));
    if (!m) return null;
    let v = m[1].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    return v;
  };

  const url = get("TURSO_DATABASE_URL");
  const token = get("TURSO_AUTH_TOKEN");

  if (!url) {
    fail("TURSO_DATABASE_URL no está en el .env.local");
    pendiente("Pon TURSO_DATABASE_URL (libsql://…) en el .env.local del admin");
  } else if (!url.startsWith("libsql://")) {
    fail(`TURSO_DATABASE_URL no parece válida: empieza por «${url.slice(0, 12)}…»`);
    pendiente("TURSO_DATABASE_URL debe empezar por libsql://");
  } else {
    ok("TURSO_DATABASE_URL presente y con formato correcto");
  }

  if (!token) {
    fail("TURSO_AUTH_TOKEN no está en el .env.local");
    pendiente("Pon TURSO_AUTH_TOKEN (el JWT largo eyJ…) en el .env.local del admin");
  } else {
    const dotCount = (token.match(/\./g) || []).length;
    const looksUrl = token.includes("://");
    const hasSpaces = /\s/.test(token);
    const jwtLike = token.startsWith("eyJ") && dotCount === 2;
    if (looksUrl) {
      fail(`TURSO_AUTH_TOKEN parece una URL (${token.slice(0, 10)}…) — ¡es el error JWT del admin!`);
      pendiente(
        `En el admin (Vercel y .env.local): TURSO_AUTH_TOKEN debe ser el JWT eyJ…, NO la URL libsql://…`
      );
    } else if (!jwtLike || hasSpaces) {
      fail("TURSO_AUTH_TOKEN no tiene formato de JWT válido (¿comillas, espacios o recortado?)");
      pendiente("Genera un token nuevo: turso db tokens create <nombre-bd>");
    } else {
      ok("TURSO_AUTH_TOKEN con formato JWT correcto");

      // Prueba de conexión REAL a Turso con las credenciales locales.
      try {
        const mod = await import("libsql");
        const db = new mod.default(url, { authToken: token });
        db.prepare("SELECT 1").all();
        ok("Conexión real a Turso con las credenciales locales: FUNCIONA");
      } catch (err) {
        if (err?.code === "ERR_MODULE_NOT_FOUND") {
          warn("libsql no está instalado en este proyecto: no se pudo probar la conexión real (aviso, no error)");
        } else {
          fail(`Conexión real a Turso falló: ${String(err?.message || err).split("\n")[0]}`);
          pendiente("Revisa URL/token de Turso (¿token caducado? regenéralo)");
        }
      }
    }
  }

  if (!get("ADMIN_PASSWORD")) {
    fail("ADMIN_PASSWORD vacío en el .env.local");
    pendiente("Pon ADMIN_PASSWORD en el .env.local del admin");
  }
  if (!get("ADMIN_SECRET")) {
    fail("ADMIN_SECRET vacío en el .env.local");
    pendiente("Pon ADMIN_SECRET (openssl rand -base64 32) en el .env.local del admin");
  }
}

/* ------------------------------------------------------------------ */
/* Resumen                                                             */
/* ------------------------------------------------------------------ */

console.log(bold("\n═══════════════════════════════════════════════"));
if (PENDIENTES.length === 0) {
  console.log(bold(`  ${green("TODO OK")} — no se detectaron problemas pendientes.`));
} else {
  console.log(bold(`  ${yellow("FALTA POR HACER")} (${PENDIENTES.length}):`));
  for (const p of PENDIENTES) console.log(p);
}
console.log(bold("═══════════════════════════════════════════════\n"));

process.exit(PENDIENTES.length === 0 ? 0 : 1);
