import "dotenv/config";

import { migrateMediaToS3 } from "@/media/migrateToS3";
import { db } from "@/prisma/db";
import { pool } from "@/prisma/pool";

/**
 * Copies every photo's filesystem original to the S3 bucket and queues its previews for
 * regeneration there (chart/README.md, "Migrating media to S3"):
 *
 *   npm run media:migrate-s3                     dry run, reports what would be copied
 *   npm run media:migrate-s3 -- --apply          copy, repoint rows, queue regeneration
 *   --limit=N --concurrency=N                    stop after N photos / N photos in flight
 *
 * Preview rendering itself happens in the media worker as it drains the queued jobs.
 */
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const numberArg = (name: string) => {
  const raw = args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
  return raw ? Number(raw) : undefined;
};

const tally = await migrateMediaToS3({
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
