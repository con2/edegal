import { legacyEnabled } from "@/config";
import {
  legacyHtmlBody,
  legacyVisibility,
  toLegacySubalbums,
} from "@/legacy/provider";
import { legacySeriesAlbums, legacySeriesBySlug } from "@/legacy/sql";
import { db } from "@/prisma/db";

import type { AlbumPageVM, Crumb, SubalbumVM, Visibility } from "./types";
import { buildMediaSet } from "./v4/provider";

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

type Member = Crumb & { date: string | null; visibility: Visibility };

interface SeriesMembers {
  /** Every member, for previous/next links. */
  all: Member[];
  /** Members with a tile, for the series page; v4 wins on equal paths. */
  tiles: SubalbumVM[];
}

/** Members from both worlds for the series with this slug. */
async function seriesMembersBySlug(slug: string): Promise<SeriesMembers> {
  const [v4Series, legacy] = await Promise.all([
    db.orm.public.Series.where({ slug }).select("id").first(),
    legacyEnabled ? legacySeriesBySlug(slug) : Promise.resolve(null),
  ]);
  const [v4Albums, legacyRows] = await Promise.all([
    v4Series
      ? db.orm.public.Album.where({ seriesId: v4Series.id })
          .include("thumbnailPhoto", (photo) => photo.include("media"))
          .all()
      : Promise.resolve([]),
    legacy ? legacySeriesAlbums(legacy.id) : Promise.resolve([]),
  ]);
  const v4Tiles: SubalbumVM[] = v4Albums.map((album) => ({
    path: album.path,
    title: album.title,
    date: album.eventDate,
    visibility: album.visibility,
    thumbnail: album.thumbnailPhoto
      ? buildMediaSet(album.thumbnailPhoto.media, "thumbnail")
      : null,
    externalUrl: album.redirectUrl.includes("://") ? album.redirectUrl : null,
    ownerId: album.ownerId,
  }));
  const v4Paths = new Set(v4Tiles.map((s) => s.path));
  const legacyOnly = legacyRows.filter((r) => !v4Paths.has(r.path));
  return {
    all: orderSeriesMembers([
      ...v4Tiles.map(({ path, title, date, visibility }) => ({
        path,
        title,
        date,
        visibility,
      })),
      ...legacyOnly.map((r) => ({
        path: r.path,
        title: r.title,
        date: r.date,
        visibility: legacyVisibility(r.is_public, r.is_visible),
      })),
    ]),
    tiles: orderSeriesMembers([...v4Tiles, ...toLegacySubalbums(legacyOnly)]),
  };
}

export async function seriesNeighbours(
  slug: string,
  albumPath: string,
): Promise<{ previous: Crumb | null; next: Crumb | null }> {
  return neighboursOf((await seriesMembersBySlug(slug)).all, albumPath);
}

/** The v4 series' updated_at as a cache version; null when only a legacy series has this slug. */
export async function seriesVersion(slug: string): Promise<string | null> {
  const row = await db.orm.public.Series.where({ slug })
    .select("updatedAt")
    .first();
  return row?.updatedAt ?? null;
}

/**
 * The series page for a slug: the v4 row when there is one, filled in from a legacy series with
 * the same slug; a legacy-only series renders on its own. Null when neither exists.
 */
export async function loadSeriesPageBySlug(
  slug: string,
): Promise<AlbumPageVM | null> {
  const [v4Series, legacy, root, members] = await Promise.all([
    db.orm.public.Series.where({ slug }).first(),
    legacyEnabled ? legacySeriesBySlug(slug) : Promise.resolve(null),
    db.orm.public.Album.where({ path: "/" }).select("title").first(),
    seriesMembersBySlug(slug),
  ]);
  if (!v4Series && !legacy) return null;
  const rootCrumb: Crumb[] = root ? [{ path: "/", title: root.title }] : [];
  const legacyBody = legacyHtmlBody(legacy?.body);
  return {
    source: v4Series ? "v4" : "legacy",
    kind: "series",
    id: v4Series ? v4Series.id : `series:${legacy!.id}`,
    parentId: null,
    path: `/${slug}`,
    title: v4Series?.title ?? legacy!.title,
    description: v4Series?.description || legacy?.description || "",
    body: v4Series?.body.trim()
      ? { kind: "markdown", text: v4Series.body }
      : legacyBody,
    cover: null,
    date: null,
    layout: "simple",
    visibility: v4Series
      ? v4Series.visibility
      : legacyVisibility(legacy!.is_public, legacy!.is_visible),
    ownerId: null,
    isOpenForSubalbums: false,
    isDownloadable: false,
    photosProcessing: 0,
    hasManualOrdering: false,
    breadcrumb: rootCrumb,
    subalbums: members.tiles,
    photos: [],
    credits: [],
    terms: null,
    previousInSeries: null,
    nextInSeries: null,
    redirectUrl: null,
    legacyAdminUrl: null,
  };
}
