import "dotenv/config";

import { claimJob, processMediaJob } from "@/media/jobs";
import { pool } from "@/legacy/pool";
import { db } from "@/prisma/db";

/**
 * Background media worker: claims pending jobs and generates previews and thumbnails. Runs as its
 * own Deployment in production and as `npm run worker` in development.
 */
const concurrency = Number(process.env.WORKER_CONCURRENCY || 2);
const idleSleepMs = 2000;
let stopping = false;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function slot(index: number) {
  while (!stopping) {
    const job = await claimJob().catch((error) => {
      console.error(
        `slot ${index}: claim failed: ${error instanceof Error ? error.message : error}`,
      );
      return null;
    });
    if (!job) {
      await sleep(idleSleepMs);
      continue;
    }
    const started = Date.now();
    await processMediaJob(job);
    console.log(
      `slot ${index}: job ${job.id} finished in ${Date.now() - started} ms`,
    );
  }
}

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    console.log(`${signal} received, finishing in-flight jobs`);
    stopping = true;
  });
}

console.log(`media worker started with concurrency ${concurrency}`);
await Promise.all(Array.from({ length: concurrency }, (_, i) => slot(i)));
await db.close();
await pool.end();
console.log("media worker stopped");
