import { Pool } from "pg";

import { databaseUrl } from "@/config";

declare global {
  var v4Pool: Pool | undefined;
}

function createPool(): Pool {
  return new Pool({ connectionString: databaseUrl, max: 10 });
}

/**
 * One pg.Pool per process. In development the module is re-evaluated on hot reload, so the pool
 * is parked on globalThis to avoid leaking connections.
 */
export const pool: Pool =
  process.env.NODE_ENV === "production"
    ? createPool()
    : (globalThis.v4Pool ??= createPool());
