import { pool } from "@/prisma/pool";

/**
 * Runs `task` if no worker process has claimed `name` within the last `intervalMs`, and returns
 * whether it ran. A run that throws or never finishes is retried only once the interval has passed.
 * `task` receives the claim time of the latest successful run, or `null` if there is none.
 */
export async function runPeriodicTask(
  name: string,
  intervalMs: number,
  task: (lastSuccessClaimedAt: Date | null) => Promise<void>,
): Promise<boolean> {
  const { rows } = await pool.query<{
    claimed_at: Date;
    last_success_claimed_at: Date | null;
  }>(
    `insert into v4_periodic_task (name, claimed_at) values ($1, now())
     on conflict (name) do update set claimed_at = now()
     where v4_periodic_task.claimed_at <= now() - $2 * interval '1 millisecond'
     returning claimed_at, last_success_claimed_at`,
    [name, intervalMs],
  );
  const claim = rows[0];
  if (!claim) return false;
  await task(claim.last_success_claimed_at);
  // A run that outlasted its interval may finish after a newer one; keep the newer success.
  await pool.query(
    `update v4_periodic_task
     set last_success_claimed_at = greatest(last_success_claimed_at, $2)
     where name = $1`,
    [name, claim.claimed_at],
  );
  return true;
}
