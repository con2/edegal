import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/prisma/db";
import { pool } from "@/prisma/pool";

import { runPeriodicTask } from "./periodicTask";

const hourMs = 60 * 60 * 1000;

beforeEach(async () => {
  await pool.query("truncate v4_periodic_task");
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

async function backdateClaim(name: string, ms: number) {
  await pool.query(
    `update v4_periodic_task
     set claimed_at = claimed_at - $2 * interval '1 millisecond',
         last_success_claimed_at = last_success_claimed_at - $2 * interval '1 millisecond'
     where name = $1`,
    [name, ms],
  );
}

describe("runPeriodicTask", () => {
  it("runs a task that has never run, with no previous success", async () => {
    const seen: (Date | null)[] = [];
    const ran = await runPeriodicTask("t", hourMs, async (last) => {
      seen.push(last);
    });
    expect(ran).toBe(true);
    expect(seen).toEqual([null]);
  });

  it("skips a task claimed within the interval, as another worker would", async () => {
    await runPeriodicTask("t", hourMs, async () => {});
    let ran = false;
    expect(
      await runPeriodicTask("t", hourMs, async () => {
        ran = true;
      }),
    ).toBe(false);
    expect(ran).toBe(false);
  });

  it("claims only once when workers race", async () => {
    const results = await Promise.all(
      Array.from({ length: 4 }, () =>
        runPeriodicTask("t", hourMs, async () => {}),
      ),
    );
    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it("hands the next run the claim time of the previous successful run", async () => {
    const before = Date.now();
    await runPeriodicTask("t", hourMs, async () => {});
    await backdateClaim("t", hourMs);

    let last: Date | null = null;
    expect(
      await runPeriodicTask("t", hourMs, async (l) => {
        last = l;
      }),
    ).toBe(true);
    expect(last!.getTime()).toBeLessThanOrEqual(before - hourMs + 1000);
  });

  it("keeps the previous success when a run fails, and waits out the interval before retrying", async () => {
    await runPeriodicTask("t", hourMs, async () => {});
    await backdateClaim("t", hourMs);
    const { rows: before } = await pool.query(
      "select last_success_claimed_at from v4_periodic_task",
    );

    await expect(
      runPeriodicTask("t", hourMs, async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    const { rows: after } = await pool.query(
      "select last_success_claimed_at from v4_periodic_task",
    );
    expect(after).toEqual(before);
    expect(await runPeriodicTask("t", hourMs, async () => {})).toBe(false);
  });
});
