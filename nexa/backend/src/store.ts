import type { DataStore } from "./storeInterface";
import { FileStore } from "./fileStore";
import { PostgresStore } from "./postgresStore";

/**
 * Picks the storage backend based on env. Everything else in the app talks
 * to the `DataStore` interface, so this is the only place that decides.
 *
 * - `DATABASE_URL` set → PostgresStore (real transactions, row locking,
 *   safe under concurrent traffic — see migrations/schema.sql).
 * - Unset → FileStore (store.json in the working directory) — convenient
 *   for local dev/demos, but single-process only. Don't run this in
 *   production; deploy Postgres and set DATABASE_URL instead.
 */
export function createStore(): DataStore {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    console.log("[store] using PostgresStore");
    return new PostgresStore(databaseUrl);
  }
  if (process.env.VERCEL) {
    // Vercel's filesystem is read-only outside /tmp, and /tmp isn't shared
    // or persisted across invocations — FileStore's store.json would
    // effectively reset (or fail to write) on every request. Fail loudly
    // instead of silently losing orders.
    throw new Error(
      "DATABASE_URL is required when deployed on Vercel — FileStore's local JSON file doesn't persist across serverless invocations. Set DATABASE_URL to a real Postgres instance (see migrations/schema.sql)."
    );
  }
  console.log("[store] DATABASE_URL not set — using FileStore (store.json, dev only)");
  return new FileStore();
}

export type { DataStore } from "./storeInterface";
