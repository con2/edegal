import type {
  AlbumPageVM,
  CreditVM,
  Crumb,
  MediaFormat,
  MediaSet,
  MediaVariant,
  PhotoVM,
  SubalbumVM,
  Visibility,
} from "@/gallery/types";
import { mostRestrictive } from "@/gallery/access";
import { pathPrefixes } from "@/gallery/paths";
import { seriesNeighbours } from "@/gallery/series";
import { formatPreference } from "@/media/specs";
import { mediaUrl } from "@/media/url";
import { compareEventDateDesc, pgTimestampToIso } from "@/lib/time";
import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { effectiveVisibilities, v4AncestorsPublicSql } from "./effective";

interface MediaRow {
  role: "original" | "preview" | "thumbnail";
  format: MediaFormat;
  width: number;
  height: number;
  storageKey: string;
  byteSize: number | null;
}

function toVariant(m: MediaRow): MediaVariant {
  return {
    src: mediaUrl(m.storageKey),
    storageKey: m.storageKey,
    width: m.width,
    height: m.height,
    format: m.format,
    byteSize: m.byteSize,
  };
}

export function buildMediaSet(
  media: MediaRow[],
  role: MediaRow["role"],
): MediaSet | null {
  const variants = media.filter((m) => m.role === role).map(toVariant);
  if (variants.length === 0) return null;
  const fallback = variants.find((v) => v.format === "jpeg") ?? variants[0];
  const alternates = variants
    .filter((v) => v.format !== fallback.format)
    .sort(
      (a, b) =>
        formatPreference.indexOf(a.format) - formatPreference.indexOf(b.format),
    );
  return { fallback, alternates };
}

/**
 * Maps one v4 photo row (with its media already loaded) to a `PhotoVM`, or null when it has no
 * thumbnail yet (still processing). `ownerId` is left undefined for a photo shown on its own
 * album's page, where the page's own owner already governs it; the timeline loader passes the
 * containing album's owner explicitly, since it flattens photos from several albums.
 */
export function v4PhotoVM(
  photo: {
    id: string;
    path: string;
    title: string;
    takenAt: string | null;
    media: MediaRow[];
  },
  visibility: Visibility,
  ownerId?: string | null,
): PhotoVM | null {
  const thumbnail = buildMediaSet(photo.media, "thumbnail");
  if (!thumbnail) return null;
  const original = photo.media.find((m) => m.role === "original");
  return {
    id: photo.id,
    path: photo.path,
    title: photo.title,
    visibility,
    takenAt: photo.takenAt ? pgTimestampToIso(photo.takenAt) : null,
    thumbnail,
    preview: buildMediaSet(photo.media, "preview"),
    original: original ? toVariant(original) : null,
    ownerId,
  };
}

interface CreditRow {
  isCopyright: boolean;
  description: string;
  photographer: {
    displayName: string;
    slug: string;
    email: string;
    visibility: Visibility;
    links: { href: string; title: string; ordering: number }[];
  };
}

function v4CreditVM(credit: CreditRow): CreditVM {
  return {
    displayName: credit.photographer.displayName,
    // A private profile's own page 404s for everyone but its owner and admins, so a link to it
    // from someone else's page would just be broken for every other visitor.
    path:
      credit.photographer.visibility === "private"
        ? null
        : `/photographers/${credit.photographer.slug}`,
    isCopyright: credit.isCopyright,
    description: credit.description,
    links: credit.photographer.links
      .slice()
      .sort((a, b) => a.ordering - b.ordering)
      .map(({ href, title }) => ({ href, title })),
  };
}

/** A copyright holder with a contact address makes the album (or photo) contactable. */
function v4Contactable(credits: CreditRow[]): boolean {
  return credits.some((c) => c.isCopyright && c.photographer.email !== "");
}

export async function loadV4Album(
  albumId: string,
): Promise<AlbumPageVM | null> {
  const album = await db.orm.public.Album.where({ id: albumId })
    .include("children", (children) =>
      // Re-sorted below by ordering then event date; querying in any order is fine.
      children.include("thumbnailPhoto", (photo) => photo.include("media")),
    )
    .include("photos", (photos) =>
      photos
        .include("media")
        .orderBy([
          (p) => p.ordering.asc(),
          (p) => p.takenAt.asc(),
          (p) => p.slug.asc(),
        ]),
    )
    .include("credits", (credits) =>
      credits
        .include("photographer", (photographer) =>
          photographer.include("links"),
        )
        .orderBy((c) => c.ordering.asc()),
    )
    .first();
  if (!album) return null;

  const ancestors = await db.orm.public.Album.where((a) =>
    a.path.in(pathPrefixes(album.path)),
  )
    .select("path", "title", "termsId", "seriesId", "visibility")
    .all();
  ancestors.sort((a, b) => a.path.length - b.path.length);
  const effectiveVisibility = mostRestrictive([
    album.visibility,
    ...ancestors.map((a) => a.visibility),
  ]);

  // The album's own series, else the nearest ancestor's, as Django does.
  const seriesId =
    [album.seriesId, ...ancestors.map((a) => a.seriesId).reverse()].find(
      (id) => id !== null,
    ) ?? null;
  const series = seriesId
    ? await db.orm.public.Series.where({ id: seriesId })
        .select("path", "title")
        .first()
    : null;
  const breadcrumb: Crumb[] = ancestors.map(({ path, title }) => ({
    path,
    title,
  }));
  if (series)
    breadcrumb.splice(1, 0, { path: series.path, title: series.title });
  const neighbours = seriesId
    ? await seriesNeighbours(seriesId, album.path)
    : { previous: null, next: null };

  // The album's own terms, else the nearest ancestor's.
  const termsId =
    [album.termsId, ...ancestors.map((a) => a.termsId).reverse()].find(
      (id) => id !== null,
    ) ?? null;
  const terms = termsId
    ? await db.orm.public.Terms.where({ id: termsId }).first()
    : null;

  const subalbums: SubalbumVM[] = album.children
    .slice()
    .sort(
      (a, b) =>
        a.ordering - b.ordering ||
        compareEventDateDesc(a.eventDate, b.eventDate),
    )
    .map((child) => ({
      path: child.path,
      title: child.title,
      date: child.eventDate,
      visibility: child.visibility,
      thumbnail: child.thumbnailPhoto
        ? buildMediaSet(child.thumbnailPhoto.media, "thumbnail")
        : null,
      externalUrl: child.redirectUrl.includes("://") ? child.redirectUrl : null,
      ownerId: child.ownerId,
    }));

  let photosProcessing = 0;
  const photos = album.photos.flatMap((photo): PhotoVM[] => {
    const vm = v4PhotoVM(photo, "public");
    if (vm) return [vm];
    if (photo.media.some((m) => m.role === "original")) photosProcessing++;
    return [];
  });

  return {
    kind: "album",
    id: album.id,
    parentId: album.parentId,
    path: album.path,
    title: album.title,
    description: album.description,
    body: album.body,
    cover: null,
    date: album.eventDate,
    layout: album.layout,
    visibility: album.visibility,
    effectiveVisibility,
    contactable: v4Contactable(album.credits),
    ownerId: album.ownerId,
    isOpenForSubalbums: album.isOpenForSubalbums,
    isDownloadable: album.isDownloadable,
    photosProcessing,
    hasManualOrdering: album.photos.some((p) => p.ordering !== 0),
    breadcrumb,
    subalbums,
    photos,
    credits: album.credits.map(v4CreditVM),
    terms: terms ? { text: terms.text, url: terms.url } : null,
    previousInSeries: neighbours.previous,
    nextInSeries: neighbours.next,
    redirectUrl: album.redirectUrl || null,
  };
}

/**
 * Every photo in a v4 album's subtree (the album itself and all descendants, any depth),
 * chronologically ordered. Each photo carries the effective visibility, owner, and
 * credits/contact/download settings of the album that actually contains it, since a timeline
 * flattens in photos from several albums that need not share any of those.
 *
 * The requested album's own direct photos are always treated as visible, matching how its normal
 * page already works (an album's own effective visibility gates whether the *page* is reachable
 * at all, not its own photos once you're on it) - only *descendants* pulled into the listing are
 * gated by their own effective visibility, the same way a subalbum tile is.
 */
export async function v4TimelinePhotos(album: {
  id: string;
  path: string;
  ownerId: string | null;
  isDownloadable: boolean;
}): Promise<PhotoVM[]> {
  const descendants = await db.orm.public.Album.where((a) =>
    a.path.like(`${album.path}/%`),
  )
    .select("id", "path", "ownerId", "isDownloadable")
    .all();
  const subtree = [
    {
      id: album.id,
      path: album.path,
      ownerId: album.ownerId,
      isDownloadable: album.isDownloadable,
    },
    ...descendants,
  ];
  const albumById = new Map(subtree.map((a) => [a.id, a]));
  const effective = await effectiveVisibilities(subtree.map((a) => a.path));

  const creditRows = await db.orm.public.AlbumCredit.where((c) =>
    c.albumId.in(subtree.map((a) => a.id)),
  )
    .include("photographer", (p) => p.include("links"))
    .orderBy((c) => c.ordering.asc())
    .all();
  const creditsByAlbum = new Map<string, CreditRow[]>();
  for (const credit of creditRows) {
    const list = creditsByAlbum.get(credit.albumId) ?? [];
    list.push(credit);
    creditsByAlbum.set(credit.albumId, list);
  }

  const photos = await db.orm.public.Photo.where((p) =>
    p.albumId.in(subtree.map((a) => a.id)),
  )
    .where((p) => p.takenAt.isNotNull())
    .include("media")
    .orderBy([(p) => p.takenAt.asc(), (p) => p.path.asc()])
    .all();

  return photos.flatMap((photo): PhotoVM[] => {
    const owningAlbum = albumById.get(photo.albumId);
    if (!owningAlbum) return [];
    const visibility =
      owningAlbum.path === album.path
        ? "public"
        : (effective.get(owningAlbum.path) ?? "private");
    const vm = v4PhotoVM(photo, visibility, owningAlbum.ownerId);
    if (!vm) return [];
    const credits = creditsByAlbum.get(owningAlbum.id) ?? [];
    return [
      {
        ...vm,
        credits: credits.map(v4CreditVM),
        contactable: v4Contactable(credits),
        isDownloadable: owningAlbum.isDownloadable,
      },
    ];
  });
}

/** Photos in effectively public albums; anything under a hidden or private album is not sampled. */
export async function v4PublicPhotoCount(): Promise<number> {
  const { rows } = await pool.query<{ n: string }>(
    `select count(*) as n from v4_photo p join v4_album a on a.id = p.album_id
     where a.visibility = 'public' and ${v4AncestorsPublicSql("a")}`,
  );
  return Number(rows[0]?.n ?? 0);
}

export async function v4RandomPublicPhotoPath(): Promise<string | null> {
  const count = await v4PublicPhotoCount();
  if (count === 0) return null;
  const { rows } = await pool.query<{ path: string }>(
    `select p.path from v4_photo p join v4_album a on a.id = p.album_id
     where a.visibility = 'public' and ${v4AncestorsPublicSql("a")}
     order by p.id offset $1 limit 1`,
    [Math.floor(Math.random() * count)],
  );
  return rows[0]?.path ?? null;
}

/** The album's updated_at, used as the cache version; null when the album does not exist. */
export async function v4AlbumVersion(albumId: string): Promise<string | null> {
  const row = await db.orm.public.Album.where({ id: albumId })
    .select("updatedAt")
    .first();
  return row?.updatedAt ?? null;
}
