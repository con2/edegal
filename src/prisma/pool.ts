import { Pool } from "pg";

import { databaseReplicaUrl, databaseUrl } from "@/config";

declare global {
  var pgPool: Pool | undefined;
  var pgReadPool: Pool | undefined;
}

function createPool(connectionString: string): Pool {
  return new Pool({ connectionString, max: 10 });
}

/**
 * One pg.Pool per process. In development the module is re-evaluated on hot reload, so the pool
 * is parked on globalThis to avoid leaking connections.
 */
export const pool: Pool =
  process.env.NODE_ENV === "production"
    ? createPool(databaseUrl)
    : (globalThis.pgPool ??= createPool(databaseUrl));

/**
 * Pool on the read replica, which may trail the primary by replication lag. Without
 * DATABASE_URL_REPLICA it is `pool` itself. Callers choose between the two through
 * `src/prisma/reader.ts`, never directly.
 */
export const readPool: Pool = databaseReplicaUrl
  ? process.env.NODE_ENV === "production"
    ? createPool(databaseReplicaUrl)
    : (globalThis.pgReadPool ??= createPool(databaseReplicaUrl))
  : pool;
