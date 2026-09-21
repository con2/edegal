import { db } from "@/prisma/db";

import type { AlbumPageVM, Crumb, SubalbumVM } from "./types";
import { effectiveVisibilities } from "./effective";
import { buildMediaSet } from "./provider";

/** Newest first, unknown dates last; ties keep their input order. */
export function orderSeriesMembers<T extends { date: string | null }>(
  members: T[],
): T[] {
  return members
    .map((m, index) => ({ m, index }))
    .sort((a, b) => {
      if (a.m.date === b.m.date) return a.index - b.index;
      if (a.m.date === null) return 1;
      if (b.m.date === null) return -1;
      return a.m.date < b.m.date ? 1 : -1;
    })
    .map(({ m }) => m);
}

/**
 * Previous (older) and next (newer) members around `path` in a date-ordered list. Private members
 * are skipped: a link from another page would reveal them.
 */
export function neighboursOf(
  members: (Crumb & { date: string | null; visibility: string })[],
  path: string,
): { previous: Crumb | null; next: Crumb | null } {
  const ordered = orderSeriesMembers(members).filter(
    (m) => m.visibility !== "private" || m.path === path,
  );
  const index = ordered.findIndex((m) => m.path === path);
  if (index < 0) return { previous: null, next: null };
  const crumb = (m: Crumb | undefined) =>
    m ? { path: m.path, title: m.title } : null;
  return {
    previous: crumb(ordered[index + 1]),
    next: crumb(ordered[index - 1]),
  };
}

/** Tiles for every album in the series, effective-visibility-aware, newest first. */
async function seriesMembersOf(seriesId: string | null): Promise<SubalbumVM[]> {
  const albums = seriesId
    ? await db.orm.public.Album.where({ seriesId })
        .include("thumbnailPhoto", (photo) => photo.include("media"))
        .all()
    : [];
  // A series is a site-wide listing, so members show their effective visibility.
  const effective = await effectiveVisibilities(albums.map((a) => a.path));
  const tiles: SubalbumVM[] = albums.map((album) => ({
    path: album.path,
    title: album.title,
    date: album.eventDate,
    visibility: effective.get(album.path) ?? album.visibility,
    thumbnail: album.thumbnailPhoto
      ? buildMediaSet(album.thumbnailPhoto.media, "thumbnail")
      : null,
    externalUrl: album.redirectUrl.includes("://") ? album.redirectUrl : null,
    ownerId: album.ownerId,
  }));
  return orderSeriesMembers(tiles);
}

export async function seriesNeighbours(
  seriesId: string,
  albumPath: string,
): Promise<{ previous: Crumb | null; next: Crumb | null }> {
  return neighboursOf(await seriesMembersOf(seriesId), albumPath);
}

export async function seriesVersion(slug: string): Promise<string | null> {
  const row = await db.orm.public.Series.where({ slug })
    .select("updatedAt")
    .first();
  return row?.updatedAt ?? null;
}

/** The series page for a slug; null when no series has it. */
export async function loadSeriesPageBySlug(
  slug: string,
): Promise<AlbumPageVM | null> {
  const v4Series = await db.orm.public.Series.where({ slug }).first();
  if (!v4Series) return null;
  const [root, tiles] = await Promise.all([
    db.orm.public.Album.where({ path: "/" }).select("title").first(),
    seriesMembersOf(v4Series.id),
  ]);
  const rootCrumb: Crumb[] = root ? [{ path: "/", title: root.title }] : [];
  return {
    kind: "series",
    id: v4Series.id,
    parentId: null,
    path: `/${slug}`,
    title: v4Series.title,
    description: v4Series.description || "",
    body: v4Series.body,
    cover: null,
    date: null,
    layout: "simple",
    visibility: v4Series.visibility,
    effectiveVisibility: v4Series.visibility,
    contactable: false,
    ownerId: null,
    isOpenForSubalbums: false,
    isDownloadable: false,
    photosProcessing: 0,
    hasManualOrdering: false,
    breadcrumb: rootCrumb,
    subalbums: tiles,
    photos: [],
    credits: [],
    terms: null,
    previousInSeries: null,
    nextInSeries: null,
    redirectUrl: null,
  };
}
