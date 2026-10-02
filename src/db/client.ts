import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { seed } from "./seed";

type DB = Database.Database;

declare global {
  var __tcnDb: DB | undefined;
}

function open(): DB {
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  const file = process.env.SAGARADHWANI_DB_PATH ?? path.join(dir, "ops.db");
  const db = new Database(file);
  const schema = fs.readFileSync(path.join(process.cwd(), "src", "db", "schema.sql"), "utf8");
  db.exec(schema);
  const count = (db.prepare("SELECT COUNT(*) AS c FROM taluk").get() as { c: number }).c;
  if (count === 0) seed(db);
  return db;
}

export function getDb(): DB {
  if (!globalThis.__tcnDb) globalThis.__tcnDb = open();
  return globalThis.__tcnDb;
}

export function resetDb(): void {
  const db = getDb();
  const tables = (db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[]).map((t) => t.name);
  db.pragma("foreign_keys = OFF");
  db.transaction(() => {
    for (const t of tables) db.prepare(`DELETE FROM "${t}"`).run();
    seed(db);
  })();
  db.pragma("foreign_keys = ON");
}

export function audit(userId: string | null, action: string, entity: string, entityId: string | null, detail?: unknown) {
  getDb()
    .prepare("INSERT INTO audit (at, user_id, action, entity, entity_id, detail) VALUES (?,?,?,?,?,?)")
    .run(new Date().toISOString(), userId, action, entity, entityId, detail == null ? null : JSON.stringify(detail));
}
