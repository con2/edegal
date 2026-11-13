import postgres from "@prisma/orm-postgres/runtime";

import { pool, readPool } from "@/prisma/pool";
import { contractFromJson } from "@prisma/orm-postgres/static";
import type { Contract } from "./contract.d.ts";
import contractJson from "./contract.json" with { type: "json" };

const contract = contractFromJson<Contract>(contractJson);

/**
 * Module-level singleton for the process lifetime. Shares its connection pool with every other
 * raw-SQL caller (`src/prisma/pool.ts`) so the app holds one pool per process.
 */
export const db = postgres({ contract, pg: pool });

/** The same contract on the read replica; `db` itself when no replica is configured. */
export const dbRead =
  readPool === pool ? db : postgres({ contract, pg: readPool });
