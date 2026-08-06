import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

/**
 * Base de datos compartida de VXCore.
 * - Fichero SQLite en `<raíz de la web>/data/vxcore.db` (o `VXCORE_DATA_DIR`).
 * - El panel admin apunta al mismo fichero para gestionar lo mismo.
 * - Modo WAL: permite que web y admin lean/escriban a la vez.
 */

export function getDataDir(): string {
  return (
    process.env.VXCORE_DATA_DIR ??
    path.join(process.cwd(), "data")
  );
}

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (db) return db;

  const dir = getDataDir();
  mkdirSync(dir, { recursive: true });
  mkdirSync(path.join(dir, "installers"), { recursive: true });

  db = new DatabaseSync(path.join(dir, "vxcore.db"));
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec(`
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

    CREATE TABLE IF NOT EXISTS installers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT NOT NULL,
      filename TEXT NOT NULL,
      size_bytes INTEGER NOT NULL DEFAULT 0,
      is_latest INTEGER NOT NULL DEFAULT 0,
      note TEXT,
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
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_email);
  `);

  return db;
}

type Row = Record<string, unknown>;

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
}): Row {
  const db = getDb();
  const info = db
    .prepare("INSERT INTO messages (user_email, sender, body) VALUES (?, ?, ?)")
    .run(input.userEmail, input.sender, input.body);
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
