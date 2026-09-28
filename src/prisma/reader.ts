import type { Pool } from "pg";

import { db, dbRead } from "@/prisma/db";
import { pool, readPool } from "@/prisma/pool";

/** The ORM client and raw pool of one data source, so a loader can be pointed at either. */
export interface Reader {
  db: typeof db;
  pool: Pool;
}

export const primary: Reader = { db, pool };

/**
 * May trail `primary` by replication lag, so it is only for reads whose viewer cannot have
 * written anything this request should reflect. Equal to `primary` when no replica is
 * configured, so callers need not check.
 */
export const replica: Reader = { db: dbRead, pool: readPool };
