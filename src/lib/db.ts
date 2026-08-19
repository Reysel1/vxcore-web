import { DatabaseSync } from "node:sqlite";
import LibsqlDatabase from "libsql";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

/**
 * Base de datos compartida de VXCore.
 *
 * Dos modos (mismo esquema, mismo SQL):
 * - LOCAL (por defecto): SQLite en `<raíz de la web>/data/vxcore.db` (o
 *   `VXCORE_DATA_DIR`). El panel admin apunta al mismo fichero.
 * - REMOTO (Vercel / nube): si existe `TURSO_DATABASE_URL` usa Turso/libSQL
 *   (SQLite en la nube). En Vercel el disco es de solo lectura: sin Turso la
 *   app degrada a memoria y muestra un aviso, pero NO crashea.
 *
 * Modo WAL en local: permite que web y admin lean/escriban a la vez.
 */

type Row = Record<string, unknown>;

type Stmt = {
  run(...params: unknown[]): { lastInsertRowid: number | bigint };
  get(...params: unknown[]): Row | undefined;
  all(...params: unknown[]): Row[];
};

type Driver = {
  exec(sql: string): void;
  prepare(sql: string): Stmt;
};

/** Error de configuración de la BD, si lo hay (null = todo OK). */
let dbError: string | null = null;

/**
 * Mensaje de error de configuración de la BD (null = funciona).
 * Fuerza la inicialización: en la primera llamada del proceso (p. ej. un
 * webhook) la BD todavía no se ha creado, y sin esto un fallo de
 * configuración pasaría desapercibido en la primera petición.
 */
export function getDbError(): string | null {
  getDb();
  return dbError;
}

/**
 * Columnas añadidas después de la primera versión del esquema.
 *
 * `CREATE TABLE IF NOT EXISTS` no toca una tabla que ya existe, así que las
 * bases creadas antes se quedarían sin estas columnas. SQLite no tiene
 * `ADD COLUMN IF NOT EXISTS`, de ahí la comprobación con PRAGMA.
 */
const MIGRATIONS: { table: string; column: string; type: string }[] = [
  { table: "installers", column: "asset_id", type: "INTEGER" },
  { table: "installers", column: "asset_repo", type: "TEXT" },
  { table: "messages", column: "ticket_id", type: "INTEGER" },
];

function migrate(driver: Driver): void {
  const columnsByTable = new Map<string, Set<string>>();

  for (const { table, column, type } of MIGRATIONS) {
    let existing = columnsByTable.get(table);
    if (!existing) {
      const info = driver.prepare(`PRAGMA table_info(${table})`).all();
      existing = new Set(info.map((row) => String(row.name)));
      columnsByTable.set(table, existing);
    }
    if (existing.has(column)) continue;
    driver.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    existing.add(column);
  }
}

/** ¿Modo remoto (Turso)? Se activa definiendo TURSO_DATABASE_URL. */
export function isRemote(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL);
}

export function getDataDir(): string {
  return (
    process.env.VXCORE_DATA_DIR ??
    path.join(process.cwd(), "data")
  );
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    image TEXT,
    provider TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    user_name TEXT,
    stripe_session_id TEXT,
    stripe_customer_id TEXT,
    payment_intent TEXT,
    amount_cents INTEGER,
    currency TEXT DEFAULT 'eur',
    plan_name TEXT DEFAULT 'Pro',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    paid_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(user_email);

  CREATE TABLE IF NOT EXISTS licenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    license_key TEXT NOT NULL UNIQUE,
    user_email TEXT NOT NULL,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_licenses_email ON licenses(user_email);
  -- Una sola licencia ACTIVA por usuario: si el webhook de Stripe se repite
  -- (respuesta perdida, reintento), no se pueden crear dos licencias.
  -- Es un índice parcial: un usuario puede tener varias históricas (revocadas).
  -- Se crea además con try/catch en getDb() por si una BD vieja ya tiene
  -- duplicados activos (ahí no se crea, pero la BD sigue funcionando).

  CREATE TABLE IF NOT EXISTS installers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT NOT NULL,
    filename TEXT NOT NULL,
    size_bytes INTEGER NOT NULL DEFAULT 0,
    is_latest INTEGER NOT NULL DEFAULT 0,
    note TEXT,
    asset_id INTEGER,
    asset_repo TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    sender TEXT NOT NULL DEFAULT 'user',
    body TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0,
    ticket_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_email);

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    subject TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    rating INTEGER,
    rating_comment TEXT,
    closed_at TEXT,
    rated_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_tickets_email ON tickets(user_email);

  -- Equipos donde está instalada la app. El agente se identifica en cada
  -- validación de licencia (cada 10 min con la app abierta), así que esta
  -- tabla se mantiene sola.
  --
  -- La licencia se guarda por clave y NO con clave foránea a propósito: la
  -- referencia se resuelve en cada consulta contra el estado vivo de la
  -- licencia. Así revocarla corta el acceso sin tener que tocar esta tabla,
  -- y el historial de qué equipo usó qué licencia no se pierde.
  CREATE TABLE IF NOT EXISTS installations (
    id TEXT PRIMARY KEY,
    license_key TEXT NOT NULL,
    name TEXT,
    first_seen TEXT NOT NULL DEFAULT (datetime('now')),
    last_seen TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_installations_license ON installations(license_key);

  -- Túnel de Cloudflare de cada instalación: es lo que le da al cliente su
  -- enlace público (<id>.reylab.cloud) sin abrir puertos en su router.
  --
  -- installation_id es la clave primaria y ahí está el motivo de la tabla:
  -- hace que aprovisionar sea idempotente. Un agente que vuelve a pedir su
  -- túnel recibe el que ya tiene; sin esto, cada reinstalación dejaría un
  -- túnel huérfano en la cuenta de Cloudflare y un DNS apuntando a la nada.
  --
  -- tunnel_secret es una credencial: con ella se puede levantar el túnel de
  -- ese cliente. Trátala como una contraseña.
  CREATE TABLE IF NOT EXISTS tunnels (
    installation_id TEXT PRIMARY KEY,
    installation_name TEXT NOT NULL DEFAULT '',
    license_key TEXT NOT NULL,
    hostname TEXT NOT NULL,
    tunnel_id TEXT NOT NULL,
    tunnel_secret TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_tunnels_license ON tunnels(license_key);
`;

let db: Driver | null = null;

function makeMemoryDriver(): Driver {
  const raw = new DatabaseSync(":memory:", {});
  raw.exec(SCHEMA);
  return {
    exec: (sql) => raw.exec(sql),
    prepare: (sql) => raw.prepare(sql) as unknown as Stmt,
  };
}

/** El driver nativo de libsql añade `_metadata` a cada fila; la limpiamos. */
function stripMeta(row: Row | undefined): Row | undefined {
  if (row && "_metadata" in row) {
    const rest: Row = { ...row };
    delete rest._metadata;
    return rest;
  }
  return row;
}

function makeLocalDriver(): Driver {
  const dir = getDataDir();
  mkdirSync(dir, { recursive: true });
  mkdirSync(path.join(dir, "installers"), { recursive: true });

  const raw = new DatabaseSync(path.join(dir, "vxcore.db"));
  raw.exec("PRAGMA journal_mode = WAL;");
  raw.exec("PRAGMA busy_timeout = 5000;");
  raw.exec(SCHEMA);

  return {
    exec: (sql) => raw.exec(sql),
    prepare: (sql) => raw.prepare(sql) as unknown as Stmt,
  };
}

function makeRemoteDriver(): Driver {
  const url = process.env.TURSO_DATABASE_URL!;
  // Para URLs file: (pruebas locales del modo remoto) creamos el directorio
  // padre del fichero si no existe.
  if (url.startsWith("file:")) {
    const filePath = url.replace(/^file:/, "");
    const dir = path.dirname(filePath);
    if (dir && dir !== ".") {
      mkdirSync(dir, { recursive: true });
    }
  }
  // El tipo de libsql no declara authToken aunque el runtime lo acepta.
  const options = {
    authToken: process.env.TURSO_AUTH_TOKEN,
  } as unknown as ConstructorParameters<typeof LibsqlDatabase>[1];
  const raw = new LibsqlDatabase(url, options);
  raw.exec(SCHEMA);

  return {
    exec: (sql) => raw.exec(sql),
    prepare: (sql) => {
      const stmt = raw.prepare(sql);
      return {
        run: (...params) =>
          stmt.run(...params) as { lastInsertRowid: number | bigint },
        get: (...params) => stripMeta(stmt.get(...params) as Row | undefined),
        all: (...params) =>
          (stmt.all(...params) as Row[]).map((r) => stripMeta(r) ?? r),
      };
    },
  };
}

export function getDb(): Driver {
  if (db) return db;
  try {
    db = isRemote() ? makeRemoteDriver() : makeLocalDriver();
    migrate(db);
    // Guardado tolerante: si una BD antigua ya tiene dos licencias activas del
    // mismo usuario, el índice no se crea pero la BD sigue funcionando.
    try {
      db.exec(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_licenses_one_active ON licenses(user_email) WHERE status = 'active'"
      );
    } catch (indexErr) {
      console.warn(
        "[VXCore] No se pudo crear el índice único de licencias activas (¿duplicados previos?):",
        indexErr instanceof Error ? indexErr.message : indexErr
      );
    }
  } catch (err) {
    // Nunca crashear: degrada a memoria y expón el error para la UI.
    const message =
      err instanceof Error
        ? err.message
        : "Error desconocido al iniciar la base de datos";
    console.error("[VXCore] Error al iniciar la base de datos:", err);
    dbError = message;
    db = makeMemoryDriver();
  }
  return db;
}

/**
 * Devuelve el driver si la base de datos funciona, o lanza un error con
 * instrucciones claras si no (para rutas de mutación que no pueden degradar
 * silenciosamente).
 */
export function requireHealthyDb(): Driver {
  const error = getDbError();
  if (error) {
    throw new Error(
      `Base de datos no disponible: ${error}. En producción configura TURSO_DATABASE_URL y TURSO_AUTH_TOKEN.`
    );
  }
  return getDb();
}

/* ------------------------------------------------------------------ */
/* Usuarios                                                            */
/* ------------------------------------------------------------------ */

export function ensureUser(input: {
  email: string;
  name?: string | null;
  image?: string | null;
  provider?: string | null;
}): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO users (email, name, image, provider)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET
       name = COALESCE(excluded.name, users.name),
       image = COALESCE(excluded.image, users.image),
       provider = COALESCE(excluded.provider, users.provider)`
  ).run(input.email, input.name ?? null, input.image ?? null, input.provider ?? null);
}

export function getUserByEmail(email: string): Row | undefined {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as
    | Row
    | undefined;
}

export function listUsers(): Row[] {
  return getDb()
    .prepare(
      `SELECT u.*,
         (SELECT COUNT(*) FROM orders o WHERE o.user_email = u.email AND o.status = 'paid') AS orders_paid,
         (SELECT COUNT(*) FROM licenses l WHERE l.user_email = u.email AND l.status = 'active') AS licenses_active
       FROM users u ORDER BY u.created_at DESC`
    )
    .all() as Row[];
}

/* ------------------------------------------------------------------ */
/* Pedidos / pagos                                                     */
/* ------------------------------------------------------------------ */

export function createOrder(input: {
  userEmail: string;
  userName?: string | null;
  planName?: string;
}): Row {
  const db = getDb();
  const info = db
    .prepare(
      `INSERT INTO orders (user_email, user_name, plan_name)
       VALUES (?, ?, ?)`
    )
    .run(input.userEmail, input.userName ?? null, input.planName ?? "Pro");
  return db
    .prepare("SELECT * FROM orders WHERE id = ?")
    .get(Number(info.lastInsertRowid)) as Row;
}

export function updateOrderSession(orderId: number, sessionId: string): void {
  getDb()
    .prepare("UPDATE orders SET stripe_session_id = ? WHERE id = ?")
    .run(sessionId, orderId);
}

export function getOrderBySessionId(sessionId: string): Row | undefined {
  return getDb()
    .prepare("SELECT * FROM orders WHERE stripe_session_id = ?")
    .get(sessionId) as Row | undefined;
}

export function markOrderPaid(
  orderId: number,
  input: {
    sessionId?: string | null;
    customerId?: string | null;
    paymentIntent?: string | null;
    amountCents?: number | null;
    currency?: string | null;
  }
): void {
  const db = getDb();
  db.prepare(
    `UPDATE orders SET
       stripe_session_id = COALESCE(?, stripe_session_id),
       stripe_customer_id = COALESCE(?, stripe_customer_id),
       payment_intent = COALESCE(?, payment_intent),
       amount_cents = COALESCE(?, amount_cents),
       currency = COALESCE(?, currency),
       status = 'paid',
       paid_at = datetime('now')
     WHERE id = ?`
  ).run(
    input.sessionId ?? null,
    input.customerId ?? null,
    input.paymentIntent ?? null,
    input.amountCents ?? null,
    input.currency ?? null,
    orderId
  );
}

export function listOrders(): Row[] {
  return getDb()
    .prepare("SELECT * FROM orders ORDER BY created_at DESC")
    .all() as Row[];
}

export function listOrdersForEmail(email: string): Row[] {
  return getDb()
    .prepare(
      "SELECT * FROM orders WHERE user_email = ? ORDER BY created_at DESC"
    )
    .all(email) as Row[];
}

export function deleteOrder(id: number): void {
  getDb().prepare("DELETE FROM orders WHERE id = ?").run(id);
}

export function hasPaid(email: string): boolean {
  const row = getDb()
    .prepare(
      "SELECT COUNT(*) AS n FROM orders WHERE user_email = ? AND status = 'paid'"
    )
    .get(email) as Row;
  return Number(row.n) > 0;
}

/* ------------------------------------------------------------------ */
/* Licencias                                                           */
/* ------------------------------------------------------------------ */

const KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateKey(): string {
  const groups: string[] = [];
  for (let g = 0; g < 4; g++) {
    const bytes = randomBytes(4);
    let group = "";
    for (let i = 0; i < 4; i++) {
      group += KEY_ALPHABET[bytes[i] % KEY_ALPHABET.length];
    }
    groups.push(group);
  }
  return `VX-${groups.join("-")}`;
}

export function createLicense(input: {
  userEmail: string;
  note?: string | null;
}): Row {
  const db = getDb();
  let key = generateKey();
  // Extremadamente improbable, pero evitamos colisiones.
  while (db.prepare("SELECT 1 FROM licenses WHERE license_key = ?").get(key)) {
    key = generateKey();
  }
  const info = db
    .prepare(
      "INSERT INTO licenses (license_key, user_email, note) VALUES (?, ?, ?)"
    )
    .run(key, input.userEmail, input.note ?? null);
  return db
    .prepare("SELECT * FROM licenses WHERE id = ?")
    .get(Number(info.lastInsertRowid)) as Row;
}

/** Busca una licencia por su clave (sin distinguir mayúsculas). */
export function getLicenseByKey(key: string): Row | undefined {
  return getDb()
    .prepare(
      "SELECT license_key, user_email, status FROM licenses WHERE LOWER(license_key) = LOWER(?)"
    )
    .get(String(key).trim()) as Row | undefined;
}

export function getActiveLicense(email: string): Row | undefined {
  return getDb()
    .prepare(
      "SELECT * FROM licenses WHERE user_email = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1"
    )
    .get(email) as Row | undefined;
}

export function getUserLicense(email: string): Row | undefined {
  return getDb()
    .prepare(
      "SELECT * FROM licenses WHERE user_email = ? ORDER BY created_at DESC LIMIT 1"
    )
    .get(email) as Row | undefined;
}

export function listLicenses(): Row[] {
  return getDb()
    .prepare("SELECT * FROM licenses ORDER BY created_at DESC")
    .all() as Row[];
}

export function setLicenseStatus(id: number, status: "active" | "revoked"): void {
  getDb().prepare("UPDATE licenses SET status = ? WHERE id = ?").run(status, id);
}

/* ------------------------------------------------------------------ */
/* Instalaciones                                                       */
/* ------------------------------------------------------------------ */

/**
 * Anota que esta instalación sigue viva y a qué licencia responde.
 *
 * Se llama desde la validación de licencia, que el agente repite cada 10 min.
 * Si el equipo cambia de clave (el dueño reactiva con otra licencia), la fila
 * se reasigna: la instalación es el equipo, no la compra.
 *
 * Esa reasignación estaba sin condiciones, y era una puerta abierta: el
 * installationId llega en el cuerpo de una petición que sólo exige *una*
 * licencia activa, no la del equipo. Cualquier cliente podía nombrar el id de
 * otro —lo lleva escrito el subdominio de su panel— y quedarse con su fila.
 * Al hacerlo no le robaba nada visible, le rompía el acceso remoto: a partir
 * de ahí el agente del dueño pedía su propio túnel y la nube le respondía
 * "esta instalación pertenece a otra licencia", para siempre y sin que nada en
 * su pantalla relacionara el fallo con alguien de fuera.
 *
 * Así que el equipo cambia de licencia sólo cuando el cambio es del dueño:
 *  - nadie lo reclamaba todavía;
 *  - es la misma licencia de siempre;
 *  - es otra compra del mismo cliente (mismo email);
 *  - o la licencia anterior ya no está activa, que es el caso de renovar
 *    después de que caducara.
 * Fuera de eso se conserva el dueño y se devuelve 'rejected'. La validación de
 * la clave no depende de esto: quien llama sigue teniendo su licencia buena,
 * simplemente no se le apunta el equipo de otro.
 */
export function touchInstallation(input: {
  id: string;
  licenseKey: string;
  name?: string | null;
}): "created" | "updated" | "rejected" {
  const db = getDb();
  const current = db
    .prepare("SELECT license_key FROM installations WHERE id = ?")
    .get(String(input.id).trim()) as Row | undefined;

  if (current && String(current.license_key).toLowerCase() !== input.licenseKey.toLowerCase()) {
    if (!canReassignInstallation(String(current.license_key), input.licenseKey)) {
      // Ni siquiera se refresca `last_seen`: el que pregunta no es su dueño y
      // no tiene por qué poder decir cuándo se vio ese equipo por última vez.
      return "rejected";
    }
  }

  db.prepare(
    `INSERT INTO installations (id, license_key, name)
       VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         license_key = excluded.license_key,
         name = COALESCE(excluded.name, installations.name),
         last_seen = datetime('now')`
  ).run(input.id, input.licenseKey, input.name?.trim() || null);

  return current ? "updated" : "created";
}

/**
 * ¿Puede `nextKey` quedarse con un equipo que hoy es de `currentKey`?
 *
 * Sí cuando es el mismo cliente comprando otra vez, y sí cuando la licencia
 * anterior ya no vale — si no, quien renueve después de que se le caduque una
 * se quedaría sin poder reutilizar su propio equipo. En cualquier otro caso,
 * no: dos licencias activas de dos personas distintas son dos clientes
 * distintos.
 */
function canReassignInstallation(currentKey: string, nextKey: string): boolean {
  const current = getLicenseByKey(currentKey);
  if (!current) return true;
  if (String(current.status) !== "active") return true;

  const next = getLicenseByKey(nextKey);
  const currentEmail = String(current.user_email ?? "").trim().toLowerCase();
  const nextEmail = String(next?.user_email ?? "").trim().toLowerCase();

  return Boolean(currentEmail) && currentEmail === nextEmail;
}

/** Equipos de una licencia, del más recientemente visto al más antiguo. */
export function listInstallationsForLicense(licenseKey: string): Row[] {
  return getDb()
    .prepare(
      "SELECT * FROM installations WHERE LOWER(license_key) = LOWER(?) ORDER BY last_seen DESC"
    )
    .all(String(licenseKey).trim()) as Row[];
}

/**
 * Todas las instalaciones con el estado VIVO de su licencia.
 *
 * El `LEFT JOIN` es lo que hace que revocar una licencia se note aquí sin
 * tocar esta tabla: `license_status` pasa a 'revoked' (o a NULL si la licencia
 * se borró) en la siguiente consulta, sin trabajo de mantenimiento.
 */
export function listInstallations(): Row[] {
  return getDb()
    .prepare(
      `SELECT i.*,
         l.status AS license_status,
         l.user_email AS license_email
       FROM installations i
       LEFT JOIN licenses l ON LOWER(l.license_key) = LOWER(i.license_key)
       ORDER BY i.last_seen DESC`
    )
    .all() as Row[];
}

export function hasActiveLicense(email: string): boolean {
  const row = getDb()
    .prepare(
      "SELECT COUNT(*) AS n FROM licenses WHERE user_email = ? AND status = 'active'"
    )
    .get(email) as Row;
  return Number(row.n) > 0;
}

/** Un usuario puede descargar si pagó o tiene una licencia activa. */
export function hasDownloadAccess(email: string): boolean {
  return hasPaid(email) || hasActiveLicense(email);
}

/* ------------------------------------------------------------------ */
/* Túneles (acceso remoto al panel)                                    */
/* ------------------------------------------------------------------ */

/** El túnel ya aprovisionado de una instalación, si lo tiene. */
export function getTunnel(installationId: string): Row | undefined {
  return getDb()
    .prepare("SELECT * FROM tunnels WHERE installation_id = ?")
    .get(String(installationId).trim()) as Row | undefined;
}

/**
 * A qué licencia responde un equipo, según la última validación.
 *
 * Sirve para no dejar que alguien con una licencia válida pida el túnel de la
 * instalación de otro cliente y se quede con su enlace.
 */
export function getInstallationOwner(installationId: string): Row | undefined {
  return getDb()
    .prepare("SELECT license_key FROM installations WHERE id = ?")
    .get(String(installationId).trim()) as Row | undefined;
}

export function saveTunnel(input: {
  installationId: string;
  installationName?: string | null;
  licenseKey: string;
  hostname: string;
  tunnelId: string;
  tunnelSecret: string;
}): void {
  getDb()
    .prepare(
      `INSERT INTO tunnels
         (installation_id, installation_name, license_key, hostname, tunnel_id, tunnel_secret)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(installation_id) DO UPDATE SET
         installation_name = excluded.installation_name,
         license_key = excluded.license_key,
         hostname = excluded.hostname,
         tunnel_id = excluded.tunnel_id,
         tunnel_secret = excluded.tunnel_secret`
    )
    .run(
      input.installationId,
      input.installationName?.trim() || "",
      input.licenseKey,
      input.hostname,
      input.tunnelId,
      input.tunnelSecret
    );
}

/**
 * Olvida el túnel de una instalación.
 *
 * Hace falta porque el aprovisionamiento es idempotente: mientras la fila
 * exista, se devuelven siempre las mismas credenciales. Eso está bien hasta
 * que el túnel deja de valer —se borró en Cloudflare, se rotó el secreto— y
 * entonces el cliente se queda reintentando con unas credenciales muertas para
 * siempre, sin nada que pueda pulsar. Borrando la fila, la siguiente petición
 * crea uno nuevo.
 */
export function deleteTunnel(installationId: string): void {
  getDb()
    .prepare("DELETE FROM tunnels WHERE installation_id = ?")
    .run(String(installationId).trim());
}

/** Túneles de una licencia, para el área de cuenta ("mis servidores"). */
export function listTunnelsForLicense(licenseKey: string): Row[] {
  return getDb()
    .prepare(
      `SELECT t.installation_id, t.installation_name, t.hostname, t.created_at,
         i.last_seen
       FROM tunnels t
       LEFT JOIN installations i ON i.id = t.installation_id
       WHERE LOWER(t.license_key) = LOWER(?)
       ORDER BY i.last_seen DESC`
    )
    .all(String(licenseKey).trim()) as Row[];
}

/* ------------------------------------------------------------------ */
/* Instaladores                                                        */
/* ------------------------------------------------------------------ */

export function addInstaller(input: {
  version: string;
  filename: string;
  sizeBytes: number;
  isLatest: boolean;
  note?: string | null;
}): void {
  const db = getDb();
  if (input.isLatest) {
    db.prepare("UPDATE installers SET is_latest = 0").run();
  }
  db.prepare(
    "INSERT INTO installers (version, filename, size_bytes, is_latest, note) VALUES (?, ?, ?, ?, ?)"
  ).run(
    input.version,
    input.filename,
    input.sizeBytes,
    input.isLatest ? 1 : 0,
    input.note ?? null
  );
}

export function getLatestInstaller(): Row | undefined {
  return getDb()
    .prepare(
      "SELECT * FROM installers WHERE is_latest = 1 ORDER BY created_at DESC LIMIT 1"
    )
    .get() as Row | undefined;
}

export function listInstallers(): Row[] {
  return getDb()
    .prepare("SELECT * FROM installers ORDER BY created_at DESC")
    .all() as Row[];
}

/* ------------------------------------------------------------------ */
/* Contactos (mensajes al staff)                                       */
/* ------------------------------------------------------------------ */

export function addContact(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): void {
  getDb()
    .prepare(
      "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)"
    )
    .run(input.name, input.email, input.subject, input.message);
}

export function listContacts(): Row[] {
  return getDb()
    .prepare("SELECT * FROM contacts ORDER BY created_at DESC")
    .all() as Row[];
}

export function setContactStatus(id: number, status: "new" | "read"): void {
  getDb().prepare("UPDATE contacts SET status = ? WHERE id = ?").run(status, id);
}

export function deleteContact(id: number): void {
  getDb().prepare("DELETE FROM contacts WHERE id = ?").run(id);
}

/* ------------------------------------------------------------------ */
/* Chat con el staff                                                   */
/* ------------------------------------------------------------------ */

export function addMessage(input: {
  userEmail: string;
  sender: "user" | "staff";
  body: string;
  ticketId?: number | null;
}): Row {
  const db = getDb();
  const info = db
    .prepare(
      "INSERT INTO messages (user_email, sender, body, ticket_id) VALUES (?, ?, ?, ?)"
    )
    .run(input.userEmail, input.sender, input.body, input.ticketId ?? null);
  return db
    .prepare("SELECT * FROM messages WHERE id = ?")
    .get(Number(info.lastInsertRowid)) as Row;
}

export function listMessages(userEmail: string): Row[] {
  return getDb()
    .prepare("SELECT * FROM messages WHERE user_email = ? ORDER BY id ASC")
    .all(userEmail) as Row[];
}

/** Marca como leídos los mensajes de un remitente en una conversación. */
export function markMessagesRead(
  userEmail: string,
  sender: "user" | "staff"
): void {
  getDb()
    .prepare(
      "UPDATE messages SET read = 1 WHERE user_email = ? AND sender = ? AND read = 0"
    )
    .run(userEmail, sender);
}

export function totalUnreadForStaff(): number {
  const row = getDb()
    .prepare(
      "SELECT COUNT(*) AS n FROM messages WHERE sender = 'user' AND read = 0"
    )
    .get() as Row;
  return Number(row.n);
}

/** Una fila por usuario con el último mensaje, fecha y no leídos. */
export function listConversations(): Row[] {
  return getDb()
    .prepare(
      `SELECT m.user_email,
         u.name AS user_name,
         (SELECT body FROM messages WHERE user_email = m.user_email ORDER BY id DESC LIMIT 1) AS last_body,
         (SELECT sender FROM messages WHERE user_email = m.user_email ORDER BY id DESC LIMIT 1) AS last_sender,
         (SELECT created_at FROM messages WHERE user_email = m.user_email ORDER BY id DESC LIMIT 1) AS last_at,
         (SELECT COUNT(*) FROM messages WHERE user_email = m.user_email AND sender = 'user' AND read = 0) AS unread
       FROM messages m
       LEFT JOIN users u ON u.email = m.user_email
       GROUP BY m.user_email
       ORDER BY last_at DESC`
    )
    .all() as Row[];
}

/* ------------------------------------------------------------------ */
/* Tickets de soporte                                                  */
/* ------------------------------------------------------------------ */

export function createTicket(input: {
  userEmail: string;
  subject?: string | null;
}): Row {
  const db = getDb();
  const info = db
    .prepare("INSERT INTO tickets (user_email, subject) VALUES (?, ?)")
    .run(input.userEmail, input.subject ?? null);
  return db
    .prepare("SELECT * FROM tickets WHERE id = ?")
    .get(Number(info.lastInsertRowid)) as Row;
}

/** Último ticket abierto del usuario (solo puede haber uno). */
export function getOpenTicket(userEmail: string): Row | undefined {
  return getDb()
    .prepare(
      "SELECT * FROM tickets WHERE user_email = ? AND status = 'open' ORDER BY id DESC LIMIT 1"
    )
    .get(userEmail) as Row | undefined;
}

/** Último ticket del usuario (abierto o cerrado). */
export function getUserTicket(userEmail: string): Row | undefined {
  return getDb()
    .prepare(
      "SELECT * FROM tickets WHERE user_email = ? ORDER BY id DESC LIMIT 1"
    )
    .get(userEmail) as Row | undefined;
}

export function getTicketById(
  id: number,
  userEmail: string
): Row | undefined {
  return getDb()
    .prepare("SELECT * FROM tickets WHERE id = ? AND user_email = ?")
    .get(id, userEmail) as Row | undefined;
}

export function closeTicket(id: number): void {
  getDb()
    .prepare(
      "UPDATE tickets SET status = 'closed', closed_at = datetime('now') WHERE id = ? AND status = 'open'"
    )
    .run(id);
}

export function rateTicket(
  id: number,
  rating: number,
  comment: string | null
): void {
  getDb()
    .prepare(
      "UPDATE tickets SET rating = ?, rating_comment = ?, rated_at = datetime('now') WHERE id = ?"
    )
    .run(rating, comment, id);
}

/** Lista de tickets del usuario (abiertos primero) con su último mensaje. */
export function listTicketsForUser(userEmail: string): Row[] {
  return getDb()
    .prepare(
      `SELECT t.*,
         (SELECT body FROM messages WHERE user_email = t.user_email ORDER BY id DESC LIMIT 1) AS last_body
       FROM tickets t
       WHERE t.user_email = ?
       ORDER BY CASE WHEN t.status = 'open' THEN 0 ELSE 1 END, t.created_at DESC`
    )
    .all(userEmail) as Row[];
}

/* ------------------------------------------------------------------ */
/* Estadísticas                                                        */
/* ------------------------------------------------------------------ */

export function getStats(): Row {
  const db = getDb();
  const one = (sql: string): number => {
    const row = db.prepare(sql).get() as Row;
    return Number(row.n ?? 0);
  };
  const revenue = db
    .prepare(
      "SELECT COALESCE(SUM(amount_cents), 0) AS total FROM orders WHERE status = 'paid'"
    )
    .get() as Row;

  return {
    users: one("SELECT COUNT(*) AS n FROM users"),
    paidOrders: one("SELECT COUNT(*) AS n FROM orders WHERE status = 'paid'"),
    pendingOrders: one(
      "SELECT COUNT(*) AS n FROM orders WHERE status = 'pending'"
    ),
    revenueCents: Number(revenue.total ?? 0),
    licensesActive: one(
      "SELECT COUNT(*) AS n FROM licenses WHERE status = 'active'"
    ),
    licensesTotal: one("SELECT COUNT(*) AS n FROM licenses"),
    installers: one("SELECT COUNT(*) AS n FROM installers"),
    contactsNew: one("SELECT COUNT(*) AS n FROM contacts WHERE status = 'new'"),
    contactsTotal: one("SELECT COUNT(*) AS n FROM contacts"),
    newUsersWeek: one(
      "SELECT COUNT(*) AS n FROM users WHERE created_at >= datetime('now', '-7 days')"
    ),
  };
}
