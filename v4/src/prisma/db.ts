import postgres from "@prisma/orm-postgres/runtime";

import { pool } from "@/legacy/pool";
import type { Contract } from "./contract.d.ts";
import contractJson from "./contract.json" with { type: "json" };

/**
 * Module-level singleton for the process lifetime. Shares its connection pool with the
 * legacy SQL module so the app holds one pool per process.
 */
export const db = postgres<Contract>({ contractJson, pg: pool });
