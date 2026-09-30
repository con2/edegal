import "dotenv/config";

import { refreshTakenAt } from "@/media/refreshTakenAt";
import { db } from "@/prisma/db";
import { pool } from "@/prisma/pool";

/**
 * Re-reads every photo's capture time from its original:
 *
 *   npm run photos:refresh-taken-at                          dry run, lists what would change
 *   npm run photos:refresh-taken-at -- --apply               write the changes
 *   --album=/path --limit=N --concurrency=N                  one album subtree / stop after N photos / N files in flight
 */
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const stringArg = (name: string) =>
  args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const numberArg = (name: string) => {
  const raw = stringArg(name);
  return raw ? Number(raw) : undefined;
};

const tally = await refreshTakenAt({
  apply,
  albumPath: stringArg("album")?.replace(/\/$/, ""),
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
