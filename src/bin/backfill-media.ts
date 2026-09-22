import "dotenv/config";

import { backfillMedia } from "@/media/backfill";
import { db } from "@/prisma/db";
import { pool } from "@/prisma/pool";

/**
 * One-off pass over media rows the legacy migration left without a file size:
 *
 *   npm run media:backfill                       dry run, reports what would change
 *   npm run media:backfill -- --apply            write sizes and dimensions, queue regeneration
 *   --limit=N --concurrency=N                    stop after N rows / N files in flight
 *
 * Regeneration itself happens in the media worker as it drains the queued jobs.
 */
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const numberArg = (name: string) => {
  const raw = args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
  return raw ? Number(raw) : undefined;
};

const tally = await backfillMedia({
  apply,
  limit: numberArg("limit"),
  concurrency: numberArg("concurrency"),
  log: (line) => console.log(line),
});

console.log(
  `${apply ? "applied" : "dry run"}:`,
  JSON.stringify(tally, null, 2),
);
await db.close();
await pool.end();
