import { compareEventDateDesc } from "@/lib/time";
import { db } from "@/prisma/db";

import { mostRestrictive } from "./access";
import { creditVM, isContactable } from "./credit";
import { buildMediaSet, photoVM } from "./media";
import { pathPrefixes } from "./paths";
import { seriesNeighbours } from "./series";
import type { AlbumPageVM, Crumb, PhotoVM, SubalbumVM } from "./types";

export async function loadAlbum(albumId: string): Promise<AlbumPageVM | null> {
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
    const vm = photoVM(photo, "public");
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
    contactable: isContactable(album.credits),
    ownerId: album.ownerId,
    isOpenForSubalbums: album.isOpenForSubalbums,
    isDownloadable: album.isDownloadable,
    photosProcessing,
    hasManualOrdering: album.photos.some((p) => p.ordering !== 0),
    breadcrumb,
    subalbums,
    photos,
    credits: album.credits.map(creditVM),
    terms: terms ? { text: terms.text, url: terms.url } : null,
    previousInSeries: neighbours.previous,
    nextInSeries: neighbours.next,
    redirectUrl: album.redirectUrl || null,
  };
}

/** The album's updated_at, used as the cache version; null when the album does not exist. */
export async function albumVersion(albumId: string): Promise<string | null> {
  const row = await db.orm.public.Album.where({ id: albumId })
    .select("updatedAt")
    .first();
  return row?.updatedAt ?? null;
}
