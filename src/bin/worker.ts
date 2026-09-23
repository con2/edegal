import "dotenv/config";

import { larpitSyncApiUrl, publicUrl } from "@/config";
import { syncFromLarpit } from "@/integrations/larpit/sync";
import { runPeriodicTask } from "@/lib/periodicTask";
import {
  claimJob,
  cleanupFinishedJobs,
  processMediaJob,
  requeueStrandedJobs,
} from "@/media/jobs";
import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

/**
 * Background media worker: claims pending jobs and generates previews and thumbnails. Runs as its
 * own Deployment in production and as `npm run worker` in development.
 */
const concurrency = Number(process.env.WORKER_CONCURRENCY || 2);
const idleSleepMs = 2000;
const strandedCheckIntervalMs = 5 * 60 * 1000;
const cleanupIntervalMs = 60 * 60 * 1000;
const larpitSyncIntervalMs = 60 * 60 * 1000;
// Incremental Larpit.fi syncs overlap by this much so clock skew between the hosts loses no larps.
const larpitSyncOverlapMs = 10 * 60 * 1000;
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

async function syncLarpit(lastSuccessClaimedAt: Date | null) {
  const { updated, mismatched } = await syncFromLarpit({
    apiUrl: larpitSyncApiUrl,
    siteUrl: publicUrl,
    updatedAfter: lastSuccessClaimedAt
      ? new Date(lastSuccessClaimedAt.getTime() - larpitSyncOverlapMs)
      : undefined,
  });
  if (updated > 0 || mismatched > 0)
    console.log(
      `maintenance: larpit sync updated ${updated} album(s), ${mismatched} mismatch(es)`,
    );
}

/** Housekeeping shared by all worker processes; every statement is safe to run concurrently. */
async function maintenance() {
  let sinceCleanupMs = cleanupIntervalMs;
  while (!stopping) {
    try {
      const { requeued, failed } = await requeueStrandedJobs();
      if (requeued > 0 || failed > 0)
        console.log(
          `maintenance: requeued ${requeued} stranded job(s), failed ${failed}`,
        );
      if (sinceCleanupMs >= cleanupIntervalMs) {
        const deleted = await cleanupFinishedJobs();
        if (deleted > 0)
          console.log(`maintenance: removed ${deleted} finished job(s)`);
        sinceCleanupMs = 0;
      }
    } catch (error) {
      console.error(
        `maintenance failed: ${error instanceof Error ? error.message : error}`,
      );
    }
    if (larpitSyncApiUrl) {
      try {
        await runPeriodicTask("larpit-sync", larpitSyncIntervalMs, syncLarpit);
      } catch (error) {
        console.error(
          `larpit sync failed: ${error instanceof Error ? error.message : error}`,
        );
      }
    }
    for (
      let waited = 0;
      waited < strandedCheckIntervalMs && !stopping;
      waited += idleSleepMs
    )
      await sleep(idleSleepMs);
    sinceCleanupMs += strandedCheckIntervalMs;
  }
}

console.log(`media worker started with concurrency ${concurrency}`);
await Promise.all([
  ...Array.from({ length: concurrency }, (_, i) => slot(i)),
  maintenance(),
]);
await db.close();
await pool.end();
console.log("media worker stopped");
