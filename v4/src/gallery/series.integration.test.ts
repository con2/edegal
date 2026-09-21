import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { loadGalleryPage } from "./load";
import { touchSeries } from "./touch";

const anonymous = { kind: "anonymous" } as const;
const admin = {
  kind: "user",
  userId: "",
  name: "Admin",
  isPhotographer: true,
  isAdmin: true,
} as const;
let seriesId: string;

/** Series "odysseus" with run-1 (public), run-3 (public), run-4 (private), and an unrelated album. */
beforeAll(async () => {
  await pool.query(
    "truncate v4_redirect, v4_series, v4_media_job, v4_media, v4_photo, v4_album_credit, v4_album, v4_user cascade",
  );

  const root = await db.orm.public.Album.create({
    slug: "",
    path: "/",
    title: "Root",
  });
  const series = await db.orm.public.Series.create({
    slug: "odysseus",
    path: "/odysseus",
    title: "Odysseus",
    description: "The voyage",
    body: "v4 body",
  });
  seriesId = series.id;
  await db.orm.public.Album.create({
    parentId: root.id,
    slug: "run-1",
    path: "/run-1",
    title: "Run 1",
    eventDate: "2023-01-01",
    seriesId,
  });
  await db.orm.public.Album.create({
    parentId: root.id,
    slug: "run-3",
    path: "/run-3",
    title: "Run 3",
    eventDate: "2024-01-01",
    seriesId,
  });
  await db.orm.public.Album.create({
    parentId: root.id,
    slug: "run-4",
    path: "/run-4",
    title: "Run 4",
    eventDate: "2025-01-01",
    seriesId,
    visibility: "private",
  });
  await db.orm.public.Album.create({
    parentId: root.id,
    slug: "lone",
    path: "/lone",
    title: "Lone",
    eventDate: "2026-01-01",
  });
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("series", () => {
  it("lists members newest first, filtered by the viewer", async () => {
    const result = await loadGalleryPage("/odysseus", anonymous);
    if (result.kind !== "ok") throw new Error(result.kind);
    expect(result.album.kind).toBe("series");
    expect(result.album.body).toBe("v4 body");
    expect(result.album.description).toBe("The voyage");
    expect(result.album.subalbums.map((s) => s.path)).toEqual([
      "/run-3",
      "/run-1",
    ]);

    const asAdmin = await loadGalleryPage("/odysseus", admin);
    if (asAdmin.kind !== "ok") throw new Error(asAdmin.kind);
    expect(asAdmin.album.subalbums.map((s) => s.path)).toEqual([
      "/run-4",
      "/run-3",
      "/run-1",
    ]);
  });

  it("links a member to its neighbours and puts the series in its breadcrumb", async () => {
    const result = await loadGalleryPage("/run-3", anonymous);
    if (result.kind !== "ok") throw new Error(result.kind);
    expect(result.album.breadcrumb.map((c) => c.path)).toEqual([
      "/",
      "/odysseus",
    ]);
    // Run 4 is private and not linked for an anonymous viewer.
    expect(result.album.previousInSeries).toEqual({
      path: "/run-1",
      title: "Run 1",
    });
    expect(result.album.nextInSeries).toBeNull();
  });

  it("touchSeries bumps the series and every member", async () => {
    const updatedAt = async (path: string) =>
      (await db.orm.public.Album.where({ path }).select("updatedAt").first())!
        .updatedAt;
    const [memberBefore, loneBefore] = await Promise.all([
      updatedAt("/run-3"),
      updatedAt("/lone"),
    ]);
    await new Promise((r) => setTimeout(r, 5));
    await touchSeries(seriesId);
    expect((await updatedAt("/run-3")) > memberBefore).toBe(true);
    expect(await updatedAt("/lone")).toBe(loneBefore);
  });

  it("refuses an album at a series path", async () => {
    const { assertPathFree, PathTakenError } = await import("@/editor/albums");
    await expect(assertPathFree("/odysseus")).rejects.toBeInstanceOf(
      PathTakenError,
    );
    await expect(assertPathFree("/admin")).rejects.toBeInstanceOf(
      PathTakenError,
    );
  });
});
