import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import {
  deleteRedirect,
  listRedirectsForAdmin,
  upsertRedirect,
} from "./manageRedirects";

beforeAll(async () => {
  await pool.query(`truncate v4_redirect cascade`);
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("upsertRedirect, listRedirectsForAdmin and deleteRedirect", () => {
  it("creates, replaces and deletes a redirect", async () => {
    await upsertRedirect("/old-path", "/new-path");
    let rows = await listRedirectsForAdmin();
    expect(rows.map((r) => [r.fromPath, r.toPath])).toEqual([
      ["/old-path", "/new-path"],
    ]);

    // Submitting the same fromPath again replaces the target rather than conflicting.
    await upsertRedirect("/old-path", "/newer-path");
    rows = await listRedirectsForAdmin();
    expect(rows).toHaveLength(1);
    expect(rows[0].toPath).toBe("/newer-path");

    await deleteRedirect("/old-path");
    rows = await listRedirectsForAdmin();
    expect(rows).toEqual([]);
  });

  it("lists an external target as is", async () => {
    await upsertRedirect("/external", "https://example.com/moved");
    const rows = await listRedirectsForAdmin();
    expect(rows.find((r) => r.fromPath === "/external")?.toPath).toBe(
      "https://example.com/moved",
    );
  });
});
