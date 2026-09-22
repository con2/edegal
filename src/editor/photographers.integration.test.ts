import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import {
  DifferentUsersError,
  findLinkCandidates,
  linkPhotographerToUser,
  mergePhotographers,
  UserAlreadyLinkedError,
} from "./photographers";

async function makeAlbum(slug: string) {
  return db.orm.public.Album.create({
    parentId: null,
    slug,
    path: `/${slug}`,
    title: slug,
  });
}

beforeAll(async () => {
  await pool.query(
    `truncate v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_redirect, v4_user cascade`,
  );
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("linkPhotographerToUser", () => {
  it("links and unlinks a profile", async () => {
    const user = await db.orm.public.User.create({
      sub: "kompassi:link-1",
      email: "link-1@example.com",
    });
    const photographer = await db.orm.public.Photographer.create({
      slug: "link-target",
      displayName: "Link Target",
    });
    await linkPhotographerToUser(photographer.id, user.id);
    expect(
      (await db.orm.public.Photographer.where({ id: photographer.id }).first())
        ?.userId,
    ).toBe(user.id);

    await linkPhotographerToUser(photographer.id, null);
    expect(
      (await db.orm.public.Photographer.where({ id: photographer.id }).first())
        ?.userId,
    ).toBeNull();
  });

  it("refuses a user already linked to another profile", async () => {
    const user = await db.orm.public.User.create({
      sub: "kompassi:link-2",
      email: "link-2@example.com",
    });
    const owner = await db.orm.public.Photographer.create({
      slug: "link-owner",
      displayName: "Link Owner",
      userId: user.id,
    });
    const other = await db.orm.public.Photographer.create({
      slug: "link-other",
      displayName: "Link Other",
    });
    await expect(
      linkPhotographerToUser(other.id, user.id),
    ).rejects.toBeInstanceOf(UserAlreadyLinkedError);
    // Relinking the same photographer to the user it already holds is a no-op, not a conflict.
    await expect(
      linkPhotographerToUser(owner.id, user.id),
    ).resolves.toBeUndefined();
  });
});

describe("findLinkCandidates", () => {
  it("suggests unlinked users by case-insensitive email, excluding already-linked ones", async () => {
    const linkedUser = await db.orm.public.User.create({
      sub: "kompassi:candidates-linked",
      email: "shared@example.com",
    });
    await db.orm.public.Photographer.create({
      slug: "candidates-linked-profile",
      displayName: "Linked Profile",
      userId: linkedUser.id,
    });
    const candidate = await db.orm.public.User.create({
      sub: "kompassi:candidates-1",
      email: "Candidate@Example.com",
    });
    await db.orm.public.User.create({
      sub: "kompassi:candidates-2",
      email: "someone-else@example.com",
    });

    expect(await findLinkCandidates("")).toEqual([]);
    const candidates = await findLinkCandidates("candidate@example.com");
    expect(candidates.map((c) => c.id)).toEqual([candidate.id]);
  });
});

describe("mergePhotographers", () => {
  it("refuses to merge a photographer into itself", async () => {
    const photographer = await db.orm.public.Photographer.create({
      slug: "self-merge",
      displayName: "Self Merge",
    });
    await expect(
      mergePhotographers(photographer.id, photographer.id),
    ).rejects.toThrow();
  });

  it("refuses when both sides are linked to different accounts", async () => {
    const userA = await db.orm.public.User.create({
      sub: "kompassi:conflict-a",
      email: "a@example.com",
    });
    const userB = await db.orm.public.User.create({
      sub: "kompassi:conflict-b",
      email: "b@example.com",
    });
    const winner = await db.orm.public.Photographer.create({
      slug: "conflict-winner",
      displayName: "Conflict Winner",
      userId: userA.id,
    });
    const loser = await db.orm.public.Photographer.create({
      slug: "conflict-loser",
      displayName: "Conflict Loser",
      userId: userB.id,
    });
    await expect(
      mergePhotographers(winner.id, loser.id),
    ).rejects.toBeInstanceOf(DifferentUsersError);
  });

  it("moves credits and links, resolves a collision, fills empty fields, transfers the user, and redirects the old slug", async () => {
    const user = await db.orm.public.User.create({
      sub: "kompassi:merge-loser-user",
      email: "loser@example.com",
    });
    const winner = await db.orm.public.Photographer.create({
      slug: "merge-winner",
      displayName: "Merge Winner",
      email: "",
      introduction: "",
    });
    const loser = await db.orm.public.Photographer.create({
      slug: "merge-loser",
      displayName: "Merge Loser",
      email: "loser@example.com",
      introduction: "Loser's own words.",
      userId: user.id,
    });

    await db.orm.public.PhotographerLink.create({
      photographerId: winner.id,
      href: "https://shared.example",
      title: "Winner's copy",
      ordering: 0,
    });
    await db.orm.public.PhotographerLink.create({
      photographerId: loser.id,
      href: "https://shared.example",
      title: "Loser's copy (duplicate, dropped)",
      ordering: 0,
    });
    await db.orm.public.PhotographerLink.create({
      photographerId: loser.id,
      href: "https://loser-only.example",
      title: "Loser only",
      ordering: 1,
    });

    const sharedAlbum = await makeAlbum("merge-shared-album");
    const loserOnlyAlbum = await makeAlbum("merge-loser-only-album");
    await db.orm.public.AlbumCredit.create({
      albumId: sharedAlbum.id,
      photographerId: winner.id,
      isCopyright: false,
      description: "winner's role",
    });
    await db.orm.public.AlbumCredit.create({
      albumId: sharedAlbum.id,
      photographerId: loser.id,
      isCopyright: true,
      description: "loser's role",
    });
    await db.orm.public.AlbumCredit.create({
      albumId: loserOnlyAlbum.id,
      photographerId: loser.id,
      isCopyright: true,
      description: "loser only",
    });

    const result = await mergePhotographers(winner.id, loser.id);

    expect(new Set(result.affectedAlbumIds)).toEqual(
      new Set([sharedAlbum.id, loserOnlyAlbum.id]),
    );
    expect(result.winnerSlug).toBe("merge-winner");
    expect(result.loserSlug).toBe("merge-loser");

    // The collision keeps the winner's row: its description survives, isCopyright is OR'd.
    const sharedCredits = await db.orm.public.AlbumCredit.where({
      albumId: sharedAlbum.id,
    }).all();
    expect(sharedCredits).toHaveLength(1);
    expect(sharedCredits[0]).toMatchObject({
      photographerId: winner.id,
      isCopyright: true,
      description: "winner's role",
    });

    // The loser-only credit moved to the winner.
    const loserOnlyCredits = await db.orm.public.AlbumCredit.where({
      albumId: loserOnlyAlbum.id,
    }).all();
    expect(loserOnlyCredits).toHaveLength(1);
    expect(loserOnlyCredits[0]).toMatchObject({
      photographerId: winner.id,
      description: "loser only",
    });

    // The duplicate href was dropped; the unique link moved over.
    const links = await db.orm.public.PhotographerLink.where({
      photographerId: winner.id,
    })
      .orderBy((l) => l.ordering.asc())
      .all();
    expect(links.map((l) => [l.href, l.title])).toEqual([
      ["https://shared.example", "Winner's copy"],
      ["https://loser-only.example", "Loser only"],
    ]);

    const merged = await db.orm.public.Photographer.where({
      id: winner.id,
    }).first();
    // Empty fields were filled in from the loser; the user linked to the loser moved over.
    expect(merged?.email).toBe("loser@example.com");
    expect(merged?.introduction).toBe("Loser's own words.");
    expect(merged?.userId).toBe(user.id);

    expect(
      await db.orm.public.Photographer.where({ id: loser.id }).first(),
    ).toBeNull();

    const redirect = await db.orm.public.Redirect.where({
      fromPath: "/photographers/merge-loser",
    }).first();
    expect(redirect?.toPath).toBe("/photographers/merge-winner");
  });
});
