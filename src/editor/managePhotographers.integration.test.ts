import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import {
  existingPhotographerEditValues,
  listPhotographersForAdmin,
  photographerEditOptions,
} from "./managePhotographers";

beforeAll(async () => {
  await pool.query(
    `truncate v4_album_credit, v4_album, v4_photographer_link, v4_photographer, v4_terms, v4_user cascade`,
  );
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("listPhotographersForAdmin", () => {
  it("lists linked and unlinked profiles, unlinked first, with a sole email-match candidate and a credit count", async () => {
    const linkedUser = await db.orm.public.User.create({
      sub: "kompassi:list-linked",
      displayName: "Linked Person",
      email: "linked@example.com",
    });
    const linked = await db.orm.public.Photographer.create({
      slug: "list-linked",
      displayName: "Linked Photographer",
      userId: linkedUser.id,
    });
    const album = await db.orm.public.Album.create({
      parentId: null,
      slug: "list-album",
      path: "/list-album",
      title: "List Album",
    });
    await db.orm.public.AlbumCredit.create({
      albumId: album.id,
      photographerId: linked.id,
      isCopyright: true,
    });

    await db.orm.public.User.create({
      sub: "kompassi:list-candidate",
      displayName: "Candidate Person",
      email: "unlinked@example.com",
    });
    await db.orm.public.Photographer.create({
      slug: "list-unlinked",
      displayName: "Unlinked Photographer",
      email: "unlinked@example.com",
    });

    const rows = await listPhotographersForAdmin();
    expect(rows.map((r) => r.slug)).toEqual(["list-unlinked", "list-linked"]);

    const unlinkedRow = rows.find((r) => r.slug === "list-unlinked");
    expect(unlinkedRow?.linkedUser).toBeNull();
    expect(unlinkedRow?.soleCandidate?.displayName).toBe("Candidate Person");

    const linkedRow = rows.find((r) => r.slug === "list-linked");
    expect(linkedRow?.linkedUser).toMatchObject({
      displayName: "Linked Person",
      email: "linked@example.com",
    });
    expect(linkedRow?.creditCount).toBe(1);
    expect(linkedRow?.soleCandidate).toBeNull();
  });
});

describe("photographerEditOptions and existingPhotographerEditValues", () => {
  it("offers every terms row, flags a user linked to a different profile, and excludes self from merge targets", async () => {
    const otherUser = await db.orm.public.User.create({
      sub: "kompassi:options-other",
      displayName: "Other User",
      email: "other@example.com",
    });
    const other = await db.orm.public.Photographer.create({
      slug: "options-other",
      displayName: "Other Photographer",
      userId: otherUser.id,
    });
    const subject = await db.orm.public.Photographer.create({
      slug: "options-subject",
      displayName: "Subject Photographer",
      email: "",
      introduction: "",
    });
    await db.orm.public.PhotographerLink.create({
      photographerId: subject.id,
      href: "https://subject.example",
      title: "Subject's link",
      ordering: 0,
    });
    await db.orm.public.Terms.create({
      title: "Someone else's terms",
      text: "Text",
    });

    const values = await existingPhotographerEditValues(subject.id);
    expect(values?.links).toEqual([
      { title: "Subject's link", href: "https://subject.example" },
    ]);
    expect(values?.userId).toBe("");

    const options = await photographerEditOptions(subject.id);
    expect(options.terms.map((t) => t.title)).toContain("Someone else's terms");
    const otherUserOption = options.users.find((u) => u.id === otherUser.id);
    expect(otherUserOption?.linkedElsewhere).toBe("Other Photographer");
    expect(options.mergeTargets.map((t) => t.id)).not.toContain(subject.id);
    expect(options.mergeTargets.map((t) => t.id)).toContain(other.id);
  });

  it("returns null for an unknown photographer", async () => {
    expect(
      await existingPhotographerEditValues(
        "00000000-0000-0000-0000-000000000000",
      ),
    ).toBeNull();
  });
});
