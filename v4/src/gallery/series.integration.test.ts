import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { pool } from "@/legacy/pool";
import { db } from "@/prisma/db";

import { loadGalleryPage } from "./load";
import { touchSeries } from "./v4/touch";

const anonymous = { kind: "anonymous" } as const;
const admin = {
  kind: "user",
  userId: "",
  name: "Admin",
  isPhotographer: true,
  isAdmin: true,
} as const;
let seriesId: string;

/**
 * Legacy series "odysseus" with runs 1 and 2 (run 2 has no cover, so Django would not list it, and
 * neither do we), and a v4 series with the same slug holding runs 3 (public) and 4 (private).
 */
beforeAll(async () => {
  await pool.query(
    "truncate v4_redirect, v4_series, v4_media_job, v4_media, v4_photo, v4_album_credit, v4_album, v4_user cascade",
  );
  await pool.query(
    "truncate edegal_media, edegal_mediaspec, edegal_picture, edegal_album, edegal_series cascade",
  );
  await pool.query(`
    insert into edegal_series (id, title, slug, description, body, is_public, is_visible, path)
    values (1, 'Odysseus (legacy)', 'odysseus', 'Legacy description', '<p>Legacy body</p>', true, true, '/odysseus')
  `);
  await pool.query(`
    insert into edegal_album (id, slug, path, title, description, body, is_public, is_visible, is_downloadable, redirect_url, layout, lft, rght, tree_id, level, date, parent_id, series_id)
    values
      (1, '', '/', 'Legacy root', '', '', true, true, true, '', 'simple', 1, 6, 1, 0, null, null, null),
      (2, 'run-1', '/run-1', 'Run 1', '', '', true, true, true, '', 'simple', 2, 3, 1, 1, '2023-01-01', 1, 1),
      (3, 'run-2', '/run-2', 'Run 2', '', '', true, true, true, '', 'simple', 4, 5, 1, 1, '2023-06-01', 1, 1)
  `);
  await pool.query(`
    insert into edegal_picture (id, slug, "order", path, title, description, is_public, album_id, taken_at)
    values (1, 'p', 0, '/run-1/p', 'P', '', true, 2, null)
  `);
  await pool.query(`update edegal_album set cover_picture_id = 1 where id = 2`);
  await pool.query(`
    insert into edegal_mediaspec (id, max_width, max_height, quality, format, role, active) values (1, 900, 240, 60, 'jpeg', 'thumbnail', true);
    insert into edegal_media (id, width, height, src, picture_id, spec_id, format, role) values (1, 900, 240, 'previews/run-1/p.jpeg', 1, 1, 'jpeg', 'thumbnail')
  `);

  const root = await db.orm.public.Album.create({
    slug: "",
    path: "/",
    title: "Root",
  });
  const series = await db.orm.public.Series.create({
    slug: "odysseus",
    path: "/odysseus",
    title: "Odysseus",
    body: "v4 body",
  });
  seriesId = series.id;
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

describe("series merged by slug", () => {
  it("lists members from both tables, newest first, filtered by the viewer", async () => {
    const result = await loadGalleryPage("/odysseus", anonymous);
    if (result.kind !== "ok") throw new Error(result.kind);
    expect(result.album.kind).toBe("series");
    expect(result.album.source).toBe("v4");
    expect(result.album.body).toEqual({ kind: "markdown", text: "v4 body" });
    expect(result.album.description).toBe("Legacy description");
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

  it("links a v4 member back to the legacy runs and puts the series in its breadcrumb", async () => {
    const result = await loadGalleryPage("/run-3", anonymous);
    if (result.kind !== "ok") throw new Error(result.kind);
    expect(result.album.breadcrumb.map((c) => c.path)).toEqual([
      "/",
      "/odysseus",
    ]);
    // Run 2 exists in the series even though it has no tile; run 4 is private and not linked.
    expect(result.album.previousInSeries).toEqual({
      path: "/run-2",
      title: "Run 2",
    });
    expect(result.album.nextInSeries).toBeNull();
  });

  it("links a legacy member forward to the v4 runs", async () => {
    const result = await loadGalleryPage("/run-2", anonymous);
    if (result.kind !== "ok") throw new Error(result.kind);
    expect(result.album.nextInSeries).toEqual({
      path: "/run-3",
      title: "Run 3",
    });
    expect(result.album.previousInSeries).toEqual({
      path: "/run-1",
      title: "Run 1",
    });
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
