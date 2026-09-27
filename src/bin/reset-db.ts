import "dotenv/config";
import { execFileSync } from "node:child_process";

import { pool } from "@/prisma/pool";

/**
 * Empties the local development database's v4 content and seeds it again. The legacy Django
 * tables and the v4 users are kept: sessions carry the user id, so whoever is signed in locally
 * stays signed in and the seed photographer gets linked to them as before. Media files that the
 * emptied rows pointed at are left on disk and in the bucket.
 */

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL must be set");
const host = new URL(databaseUrl).hostname;
if (!["localhost", "127.0.0.1", "::1"].includes(host)) {
  throw new Error(`refusing to reset a database on ${host}: local hosts only`);
}

const keptTables = new Set(["v4_user"]);

async function truncateContent() {
  const { rows } = await pool.query<{ tablename: string }>(
    "select tablename from pg_tables where schemaname = 'public' and tablename like 'v4\\_%'",
  );
  const tables = rows
    .map((r) => r.tablename)
    .filter((name) => !keptTables.has(name));
  await pool.query(
    `truncate ${tables.map((t) => `"${t}"`).join(", ")} cascade`,
  );
  console.log(`emptied ${tables.join(", ")}`);
}

function run(command: string, args: string[]) {
  execFileSync(command, args, { stdio: "inherit" });
}

try {
  run("npx", ["prisma", "db", "migrate", "--advance-ref", "db", "--quiet"]);
  await truncateContent();
} finally {
  await pool.end();
}
run("npx", ["tsx", "src/bin/seed.ts"]);
