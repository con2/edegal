import "dotenv/config";

import { larpitSyncApiUrl, publicUrl } from "@/config";
import { syncFromLarpit } from "@/integrations/larpit/sync";
import { runPeriodicTask } from "@/lib/periodicTask";
import {
  claimJob,
  cleanupFinishedJobs,
  cleanupStaleUploads,
  processMediaJob,
  requeueStrandedJobs,
} from "@/media/jobs";
import {
  checkMediaWritable,
  WorkerEnvironmentError,
} from "@/media/workerHealth";
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
const writeCheckIntervalMs = 60 * 1000;
const writeCheckTimeoutMs = 60 * 1000;
let stopping = false;
/** Set when the worker stops because its surroundings are broken; the process then exits with 1. */
let environmentFailure = false;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sleepUnlessStopping(ms: number) {
  for (let waited = 0; waited < ms && !stopping; waited += idleSleepMs)
    await sleep(idleSleepMs);
}

function describe(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Stops claiming jobs so that a fresh container, once its media storage works, takes them over
 * instead of this one failing every job it claims.
 */
function stopForEnvironment(reason: string, error: unknown) {
  if (!environmentFailure)
    console.error(`${reason}, stopping: ${describe(error)}`);
  environmentFailure = true;
  stopping = true;
}

/**
 * Exits at once when the check hangs, as writes to a hard-mounted NFS export do while the server
 * is unreachable: the stuck call cannot be cancelled, and in-flight jobs would never finish.
 */
async function checkMediaWritableOrExit() {
  const timer = setTimeout(() => {
    console.error(
      `media storage write check did not finish in ${writeCheckTimeoutMs} ms, exiting`,
    );
    process.exit(1);
  }, writeCheckTimeoutMs);
  try {
    await checkMediaWritable();
  } finally {
    clearTimeout(timer);
  }
}

async function watchMediaStorage() {
  while (!stopping) {
    await sleepUnlessStopping(writeCheckIntervalMs);
    if (stopping) break;
    await checkMediaWritableOrExit().catch((error) =>
      stopForEnvironment("media storage is not writable", error),
    );
  }
}

async function slot(index: number) {
  while (!stopping) {
    const job = await claimJob().catch((error) => {
      console.error(`slot ${index}: claim failed: ${describe(error)}`);
      return null;
    });
    if (!job) {
      await sleep(idleSleepMs);
      continue;
    }
    const started = Date.now();
    try {
      await processMediaJob(job);
    } catch (error) {
      if (!(error instanceof WorkerEnvironmentError)) throw error;
      stopForEnvironment(
        `slot ${index}: job ${job.id} hit a broken environment`,
        error,
      );
      break;
    }
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
        const staleUploads = await cleanupStaleUploads();
        if (staleUploads > 0)
          console.log(
            `maintenance: removed ${staleUploads} abandoned upload(s)`,
          );
        sinceCleanupMs = 0;
      }
    } catch (error) {
      console.error(`maintenance failed: ${describe(error)}`);
    }
    if (larpitSyncApiUrl) {
      try {
        await runPeriodicTask("larpit-sync", larpitSyncIntervalMs, syncLarpit);
      } catch (error) {
        console.error(`larpit sync failed: ${describe(error)}`);
      }
    }
    await sleepUnlessStopping(strandedCheckIntervalMs);
    sinceCleanupMs += strandedCheckIntervalMs;
  }
}

// A container restarted on a broken mount fails here and claims nothing, so pending jobs keep
// their attempts until a healthy worker picks them up.
try {
  await checkMediaWritableOrExit();
} catch (error) {
  console.error(`media storage is not writable, exiting: ${describe(error)}`);
  process.exit(1);
}
console.log(`media worker started with concurrency ${concurrency}`);
await Promise.all([
  ...Array.from({ length: concurrency }, (_, i) => slot(i)),
  maintenance(),
  watchMediaStorage(),
]);
await db.close();
await pool.end();
console.log("media worker stopped");
if (environmentFailure) process.exitCode = 1;
