import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { listUsersForAdmin } from "./manageUsers";

beforeAll(async () => {
  await pool.query(`truncate v4_photographer, v4_user cascade`);
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("listUsersForAdmin", () => {
  it("flags whether each user has a linked profile, sorted by display name", async () => {
    const linkedUser = await db.orm.public.User.create({
      sub: "kompassi:users-linked",
      displayName: "Zeta Linked",
      email: "zeta@example.com",
    });
    await db.orm.public.Photographer.create({
      slug: "users-linked",
      displayName: "Zeta's Profile",
      userId: linkedUser.id,
    });
    await db.orm.public.User.create({
      sub: "kompassi:users-unlinked",
      displayName: "Alpha Unlinked",
      email: "alpha@example.com",
    });

    const rows = await listUsersForAdmin();
    expect(rows.map((r) => r.displayName)).toEqual([
      "Alpha Unlinked",
      "Zeta Linked",
    ]);

    const linkedRow = rows.find((r) => r.id === linkedUser.id);
    expect(linkedRow?.linkedPhotographer?.displayName).toBe("Zeta's Profile");

    const unlinkedRow = rows.find((r) => r.displayName === "Alpha Unlinked");
    expect(unlinkedRow?.linkedPhotographer).toBeNull();
  });
});
