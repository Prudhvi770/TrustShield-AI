// Server-only. Wraps a mysql2 connection pool in Drizzle and hands the app
// a single `db` object to query with. This replaces the old Supabase
// client (which talked to Postgres over HTTP through PostgREST) — here we
// connect straight to MySQL over TCP instead.
//
// Nothing in this file should ever be imported from client-side code; it
// pulls in mysql2, which doesn't run in the browser. Route handlers under
// src/routes/api/** are server-only by construction, so that's fine.
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// `drizzle()` is overloaded, so deriving the exported type from
// `ReturnType<typeof drizzle<...>>` directly can pick a different overload
// than the one we actually call below, and TypeScript ends up seeing two
// "different" MySql2Database types with the same name. Routing both the
// type and the real call through this one function keeps them in sync.
function connect(pool: mysql.Pool) {
  return drizzle(pool, { schema, mode: "default" as const });
}

export type Database = ReturnType<typeof connect>;

function readConnectionConfig(): string | mysql.PoolOptions | null {
  const url = process.env["DATABASE_URL"];
  if (url) return url;

  const host = process.env["MYSQL_HOST"];
  const user = process.env["MYSQL_USER"];
  const database = process.env["MYSQL_DATABASE"];
  if (!host || !user || !database) return null;

  const password = process.env["MYSQL_PASSWORD"];
  const port = process.env["MYSQL_PORT"] ? Number(process.env["MYSQL_PORT"]) : 3306;

  // Only include `password` when it's actually set — with
  // exactOptionalPropertyTypes on, `password: undefined` isn't the same
  // thing as the key being absent.
  return { host, user, database, port, ...(password ? { password } : {}) };
}

let db: Database | undefined;

/** True once MySQL connection details are present in the environment. */
export function isDatabaseConfigured(): boolean {
  return readConnectionConfig() !== null;
}

/**
 * Lazily creates (and reuses) the shared connection pool + Drizzle client.
 * Returns null when no connection details are configured, so callers can
 * fall back to Demo Mode instead of throwing on every request.
 */
export function getDb(): Database | null {
  if (db) return db;

  const config = readConnectionConfig();
  if (!config) return null;

  const pool = typeof config === "string" ? mysql.createPool(config) : mysql.createPool(config);
  db = connect(pool);
  return db;
}
