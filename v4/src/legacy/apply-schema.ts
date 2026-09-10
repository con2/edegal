import "dotenv/config";
import { readFileSync } from "node:fs";
import { Client } from "pg";

/**
 * Creates the legacy Django tables (empty) in a database that does not have them, so the
 * legacy code paths and their tests run against a fresh database. A database restored from a
 * production dump already has them and is left alone.
 */
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const existing = await client.query(
    "select to_regclass('public.edegal_album') as t",
  );
  if (existing.rows[0].t) {
    console.log("legacy tables already present, nothing to do");
  } else {
    await client.query(
      readFileSync(
        new URL("../../legacy-schema/edegal.sql", import.meta.url),
        "utf8",
      ),
    );
    console.log("legacy tables created");
  }
} finally {
  await client.end();
}
