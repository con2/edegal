import { slugifyDash } from "@con2/components/helpers";

import { recordMove } from "@/gallery/redirects";
import { touchAlbum } from "@/gallery/touch";
import { pickAutoThumbnail } from "@/media/jobs";
import { db } from "@/prisma/db";

import { assertPathFree, childPath, PathTakenError } from "./albums";

export interface TopLevelPhotosOptions {
  /** Without this, every album is still inspected but nothing is written. */
  apply: boolean;
  log?: (line: string) => void;
}

export interface TopLevelPhotosTally {
  albumsInspected: number;
  albumsMoved: number;
  photosMoved: number;
  /** Top-level albums holding photos but crediting no photographer; left untouched. */
  albumsWithoutCredits: number;
  /** The photographer album's path was already taken; left untouched. */
  albumsWithPathTaken: number;
}

/**
 * Larppikuvat.fi keeps every top-level album for one larp, with each photographer's photos in a
 * subalbum named after them. This moves photos found directly in a top-level album into such a
 * subalbum: the photographer credits and terms move with the photos, the album's own text and
 * settings stay. A top-level album crediting nobody has no name to file its photos under, so it
 * is only reported. Safe to rerun: a top-level album without photos is never touched.
 */
export async function moveTopLevelPhotosToPhotographerAlbums(
  options: TopLevelPhotosOptions,
): Promise<TopLevelPhotosTally> {
  const log = options.log ?? (() => {});
  const tally: TopLevelPhotosTally = {
    albumsInspected: 0,
    albumsMoved: 0,
    photosMoved: 0,
    albumsWithoutCredits: 0,
    albumsWithPathTaken: 0,
  };
  const root = await db.orm.public.Album.where({ path: "/" })
    .select("id")
    .first();
  if (!root) throw new Error("root album not found");

  const albums = await db.orm.public.Album.where({ parentId: root.id })
    .include("photos")
    .include("credits", (q) => q.include("photographer"))
    .orderBy((a) => a.path.asc())
    .all();

  for (const album of albums) {
    if (album.photos.length === 0) continue;
    tally.albumsInspected++;
    if (album.credits.length === 0) {
      tally.albumsWithoutCredits++;
      log(
        `warning: ${album.path} has ${album.photos.length} photos but no photographer credits; skipped`,
      );
      continue;
    }
    const credits = [...album.credits].sort((a, b) => a.ordering - b.ordering);
    const title = credits.map((c) => c.photographer.displayName).join(" & ");
    const slug = slugifyDash(title) || "photographer";
    const path = childPath(album.path, slug);
    try {
      await assertPathFree(path);
    } catch (error) {
      if (!(error instanceof PathTakenError)) throw error;
      tally.albumsWithPathTaken++;
      log(
        `warning: ${album.path} has ${album.photos.length} photos but ${path} already exists; skipped`,
      );
      continue;
    }
    log(
      `${album.path}: ${options.apply ? "moving" : "would move"} ${album.photos.length} photos to ${path} (${title})`,
    );
    tally.albumsMoved++;
    tally.photosMoved += album.photos.length;
    if (!options.apply) continue;

    const ownerId =
      credits.length === 1 ? credits[0].photographer.userId : null;
    const childId = await db.transaction(async (tx) => {
      const child = await tx.orm.public.Album.create({
        parentId: album.id,
        slug,
        path,
        title,
        layout: album.layout,
        isDownloadable: album.isDownloadable,
        eventDate: album.eventDate,
        termsId: album.termsId,
        ownerId: ownerId ?? album.ownerId,
      });
      await tx.orm.public.AlbumCredit.where({
        albumId: album.id,
      }).updateAndCount({ albumId: child.id });
      await tx.orm.public.Album.where({ id: album.id }).update({
        termsId: null,
      });
      for (const photo of album.photos) {
        const target = childPath(path, photo.slug);
        await recordMove(tx, photo.path, target);
        await tx.orm.public.Photo.where({ id: photo.id }).update({
          albumId: child.id,
          path: target,
          // Derivatives are stored under the path the photo had when its original was written;
          // an empty base means "use `path`", which is about to change.
          mediaKeyBase: photo.mediaKeyBase || photo.path,
        });
      }
      if (album.photos.some((p) => p.id === album.thumbnailPhotoId))
        await tx.orm.public.Album.where({ id: child.id }).update({
          thumbnailPhotoId: album.thumbnailPhotoId,
          thumbnailIsAuto: album.thumbnailIsAuto,
        });
      return child.id;
    });
    // Outside the transaction: the picker reads through the pool and would not see the moved rows.
    if (!album.photos.some((p) => p.id === album.thumbnailPhotoId))
      await db.orm.public.Album.where({ id: childId }).update({
        thumbnailPhotoId: await pickAutoThumbnail(childId),
      });
    await touchAlbum(album.id, root.id);
  }
  return tally;
}
