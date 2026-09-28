import postgres from "@prisma/orm-postgres/runtime";

import { pool, readPool } from "@/prisma/pool";
import type { Contract } from "./contract.d.ts";
import contractJson from "./contract.json" with { type: "json" };

/**
 * Module-level singleton for the process lifetime. Shares its connection pool with every other
 * raw-SQL caller (`src/prisma/pool.ts`) so the app holds one pool per process.
 */
export const db = postgres<Contract>({ contractJson, pg: pool });

/** The same contract on the read replica; `db` itself when no replica is configured. */
export const dbRead =
  readPool === pool ? db : postgres<Contract>({ contractJson, pg: readPool });
