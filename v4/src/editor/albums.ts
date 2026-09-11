import { slugifyDash } from "@con2/components/helpers";

import { canCreateSubalbum, canEditAlbum } from "@/gallery/access";
import { isAncestorOrSelf, pathPrefixes } from "@/gallery/paths";
import { resolvePath } from "@/gallery/resolve";
import type { Viewer } from "@/gallery/viewer";
import { parseOrderingNumber } from "@/media/naming";
import { mediaStorage } from "@/media/storage";
import { db } from "@/prisma/db";

import type { CreditInput } from "./schemas";

export class PathTakenError extends Error {}

export function childPath(parentPath: string, slug: string): string {
  return parentPath === "/" ? `/${slug}` : `${parentPath}/${slug}`;
}

export function slugForAlbum(title: string, requested: string): string {
  return requested || slugifyDash(title) || "album";
}

/** Refuses paths already used by any v4 or legacy album or photo (other than `selfAlbumId`). */
export async function assertPathFree(
  path: string,
  selfAlbumId?: string,
): Promise<void> {
  const taken = await resolvePath(path);
  if (!taken) return;
  if (
    taken.kind === "album" &&
    taken.source === "v4" &&
    taken.albumId === selfAlbumId
  )
    return;
  throw new PathTakenError(path);
}

export async function replaceCredits(
  albumId: string,
  credits: CreditInput[],
): Promise<void> {
  await db.orm.public.AlbumCredit.where({ albumId }).deleteAndCount();
  if (credits.length === 0) return;
  await db.orm.public.AlbumCredit.createAll(
    credits.map((c, index) => ({
      albumId,
      photographerId: c.photographerId,
      isCopyright: c.isCopyright,
      description: c.description,
      ordering: index,
    })),
  );
}

/**
 * Moves an album to a new path together with every descendant album and photo. Storage keys are
 * left alone: files never move.
 */
/**
 * Before a move or rename, checks that every descendant album and photo lands on a free path.
 * The unique index would catch v4 collisions anyway, but legacy content is only found this way.
 */
export async function assertSubtreePathsFree(
  oldPath: string,
  newPath: string,
): Promise<void> {
  if (oldPath === newPath) return;
  const [albums, photos] = await Promise.all([
    db.orm.public.Album.where((a) => a.path.like(`${oldPath}/%`))
      .select("id", "path")
      .all(),
    db.orm.public.Photo.where((p) => p.path.like(`${oldPath}/%`))
      .select("path")
      .all(),
  ]);
  for (const album of albums)
    await assertPathFree(newPath + album.path.slice(oldPath.length), album.id);
  for (const photo of photos)
    await assertPathFree(newPath + photo.path.slice(oldPath.length));
}

export async function moveAlbumPath(
  albumId: string,
  oldPath: string,
  newPath: string,
): Promise<void> {
  if (oldPath === newPath) return;
  await db.transaction(async (tx) => {
    await tx.orm.public.Album.where({ id: albumId }).update({ path: newPath });
    const descendants = await tx.orm.public.Album.where((a) =>
      a.path.like(`${oldPath}/%`),
    )
      .select("id", "path")
      .all();
    for (const album of descendants) {
      await tx.orm.public.Album.where({ id: album.id }).update({
        path: newPath + album.path.slice(oldPath.length),
      });
    }
    const photos = await tx.orm.public.Photo.where((p) =>
      p.path.like(`${oldPath}/%`),
    )
      .select("id", "path")
      .all();
    for (const photo of photos) {
      await tx.orm.public.Photo.where({ id: photo.id }).update({
        path: newPath + photo.path.slice(oldPath.length),
      });
    }
  });
}

/** Ids of the album and all its descendants, deepest first. */
export async function albumSubtree(
  albumId: string,
  path: string,
): Promise<{ id: string; path: string; ownerId: string | null }[]> {
  const [descendants, self] = await Promise.all([
    db.orm.public.Album.where((a) => a.path.like(`${path}/%`))
      .select("id", "path", "ownerId")
      .all(),
    db.orm.public.Album.where({ id: albumId })
      .select("id", "path", "ownerId")
      .first(),
  ]);
  return [...descendants, ...(self ? [self] : [])].sort(
    (a, b) => b.path.length - a.path.length,
  );
}

/** Deletes an album subtree: files first, then rows (parent links are RESTRICT, so leaves first). */
export async function deleteAlbumSubtree(
  albumId: string,
  path: string,
): Promise<{ albums: number; photos: number }> {
  const subtree = await albumSubtree(albumId, path);
  const albumIds = subtree.map((a) => a.id);
  const photos = await db.orm.public.Photo.where((p) => p.albumId.in(albumIds))
    .include("media")
    .all();
  // Rows go first, in one transaction: a leftover file is harmless, a row pointing at a
  // deleted file is a permanently broken photo.
  await db.transaction(async (tx) => {
    for (const album of subtree)
      await tx.orm.public.Album.where({ id: album.id }).delete();
  });
  await deleteStorageKeys(
    photos.flatMap((p) => p.media.map((m) => m.storageKey)),
  );
  return { albums: subtree.length, photos: photos.length };
}

export async function photoStorageKeys(photoId: string): Promise<string[]> {
  const media = await db.orm.public.Media.where({ photoId })
    .select("storageKey")
    .all();
  return media.map((m) => m.storageKey);
}

export async function deleteStorageKeys(keys: string[]): Promise<void> {
  for (const key of keys) await mediaStorage.delete(key);
}

export type PhotoSort = "takenAt" | "filename";

/**
 * "takenAt" clears manual orderings so capture time decides again. "filename" numbers photos by the
 * number in their name (camera counters), falling back to natural filename order.
 */
export async function sortPhotos(
  albumId: string,
  by: PhotoSort,
): Promise<void> {
  if (by === "takenAt") {
    await db.orm.public.Photo.where({ albumId }).updateAndCount({
      ordering: 0,
    });
    return;
  }
  const photos = await db.orm.public.Photo.where({ albumId })
    .select("id", "slug")
    .all();
  const collator = new Intl.Collator("en", { numeric: true });
  const sorted = [...photos].sort((a, b) => {
    const na = parseOrderingNumber(a.slug);
    const nb = parseOrderingNumber(b.slug);
    if (na !== null && nb !== null && na !== nb) return na - nb;
    if (na !== null && nb === null) return -1;
    if (na === null && nb !== null) return 1;
    return collator.compare(a.slug, b.slug);
  });
  await db.transaction(async (tx) => {
    for (const [index, photo] of sorted.entries()) {
      await tx.orm.public.Photo.where({ id: photo.id }).update({
        ordering: (index + 1) * 10,
      });
    }
  });
}

export interface ThumbnailTarget {
  albumId: string;
  title: string;
  /** The photo's own album, as opposed to one of its ancestors. */
  isOwnAlbum: boolean;
}

/**
 * The albums whose thumbnail the viewer may set to a photo of `album`: the album itself and
 * its ancestors, nearest first, that the viewer may edit. The root is left out because the
 * front page has no tile of its own.
 */
export async function thumbnailTargets(
  viewer: Viewer,
  album: { id: string; path: string; ownerId: string | null; title: string },
): Promise<ThumbnailTarget[]> {
  const targets: ThumbnailTarget[] = [];
  if (canEditAlbum(viewer, { source: "v4", ownerId: album.ownerId }))
    targets.push({ albumId: album.id, title: album.title, isOwnAlbum: true });
  const prefixes = pathPrefixes(album.path).filter((p) => p !== "/");
  if (prefixes.length === 0) return targets;
  const ancestors = await db.orm.public.Album.where((a) => a.path.in(prefixes))
    .select("id", "path", "title", "ownerId")
    .all();
  ancestors.sort((a, b) => b.path.length - a.path.length);
  for (const ancestor of ancestors)
    if (canEditAlbum(viewer, { source: "v4", ownerId: ancestor.ownerId }))
      targets.push({
        albumId: ancestor.id,
        title: ancestor.title,
        isOwnAlbum: false,
      });
  return targets;
}

export interface MoveTarget {
  id: string;
  path: string;
  title: string;
}

/**
 * Albums that may become `album`'s new parent: every v4 album the viewer may create subalbums
 * in, except the album itself and everything below it. Sorted by path so the list reads like a
 * tree.
 */
export async function moveTargets(
  viewer: Viewer,
  album: { id: string; path: string },
): Promise<MoveTarget[]> {
  const albums = await db.orm.public.Album.select(
    "id",
    "path",
    "title",
    "ownerId",
    "isOpenForSubalbums",
  ).all();
  return albums
    .filter(
      (a) =>
        !isAncestorOrSelf(album.path, a.path) &&
        canCreateSubalbum(viewer, {
          source: "v4",
          ownerId: a.ownerId,
          isOpenForSubalbums: a.isOpenForSubalbums,
        }),
    )
    .sort((a, b) => a.path.localeCompare(b.path))
    .map(({ id, path, title }) => ({ id, path, title }));
}

/**
 * Terms an album (or a profile default) may point at: the viewer's own and shared ones, or any
 * for admins. Mirrors the choices the form offers, so a forged id is rejected the same way.
 */
export async function usableTermsId(
  viewer: Viewer,
  termsId: string,
): Promise<string | null> {
  if (!termsId) return null;
  const terms = await db.orm.public.Terms.where({ id: termsId })
    .select("id", "ownerId")
    .first();
  if (!terms) throw new Error("terms not found");
  const allowed =
    terms.ownerId === null ||
    (viewer.kind === "user" &&
      (viewer.isAdmin || terms.ownerId === viewer.userId));
  if (!allowed) throw new Error("not allowed to use these terms");
  return terms.id;
}
