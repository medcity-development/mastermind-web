import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

// Development-only persistence. Production instances must share Redis.
export async function localPaymentCommand(args, filename = join(process.cwd(), ".data", "payments.sqlite")) {
  const { DatabaseSync } = await import("node:sqlite");
  mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  try {
    db.exec("PRAGMA busy_timeout = 5000");
    db.exec("CREATE TABLE IF NOT EXISTS payment_records (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
    const [operation, key, value, condition] = args;
    if (operation === "GET") {
      return db.prepare("SELECT value FROM payment_records WHERE key = ?").get(key)?.value ?? null;
    }
    if (operation === "DEL") {
      return db.prepare("DELETE FROM payment_records WHERE key = ?").run(key).changes;
    }
    if (operation === "SET") {
      const sql = condition === "NX"
        ? "INSERT OR IGNORE INTO payment_records (key, value) VALUES (?, ?)"
        : "INSERT INTO payment_records (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value";
      return db.prepare(sql).run(key, value).changes ? "OK" : null;
    }
    throw new Error("Unsupported local payment operation.");
  } finally {
    db.close();
  }
}
