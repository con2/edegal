import {
  assertPathFree,
  childPath,
  PathTakenError,
  replaceCredits,
  slugForAlbum,
} from "@/editor/albums";
import { today } from "@/editor/formData";
import { ensurePhotographer } from "@/editor/photographers";
import { invalidateAlbum } from "@/gallery/cache";
import { clearRedirect } from "@/gallery/redirects";
import type { Visibility } from "@/gallery/types";
import { touchAlbum } from "@/gallery/v4/touch";
import type { Viewer } from "@/gallery/viewer";
import {
  coverFilename,
  fetchCoverImage,
  fetchFlickrAlbum,
  FlickrImportError,
  type FlickrImportErrorCode,
  removeKnownSuffixes,
  splitDateFromTitle,
} from "@/importers/flickr";
import { addPhotoToAlbum } from "@/media/addPhoto";
import { db } from "@/prisma/db";

export interface FlickrImportInput {
  flickrUrl: string;
  /** Overrides the title Flickr gives; empty takes Flickr's, with a date in it lifted out. */
  title: string;
  visibility: Visibility;
}

export type FlickrImportResult =
  | { ok: true; path: string; coverImported: boolean }
  | { ok: false; error: FlickrImportErrorCode | "pathTaken" };

/**
 * Creates a subalbum that redirects to a Flickr album, credited to the importing photographer,
 * with Flickr's cover picture as its only photo so that it gets a thumbnail. The cover is
 * optional: an album link without a thumbnail is still an album link.
 */
export async function importFlickrAlbum(
  viewer: Viewer & { kind: "user" },
  parent: { id: string; path: string },
  input: FlickrImportInput,
  fetchImpl: typeof fetch = fetch,
): Promise<FlickrImportResult> {
  let meta;
  try {
    meta = await fetchFlickrAlbum(input.flickrUrl, fetchImpl);
  } catch (error) {
    if (error instanceof FlickrImportError)
      return { ok: false, error: error.code };
    throw error;
  }
  const named = input.title
    ? { title: input.title, eventDate: null }
    : splitDateFromTitle(removeKnownSuffixes(meta.title));
  const slug = slugForAlbum(named.title, "");
  const path = childPath(parent.path, slug);
  try {
    await assertPathFree(path);
  } catch (error) {
    if (error instanceof PathTakenError)
      return { ok: false, error: "pathTaken" };
    throw error;
  }

  const photographer = await ensurePhotographer(viewer);
  const album = await db.orm.public.Album.create({
    parentId: parent.id,
    slug,
    path,
    title: named.title,
    body: meta.description,
    visibility: input.visibility,
    layout: "simple",
    isOpenForSubalbums: false,
    isDownloadable: false,
    ordering: 0,
    eventDate: named.eventDate ?? today(),
    eventMetadataUrl: "",
    termsId: photographer.defaultTermsId,
    ownerId: viewer.userId,
    redirectUrl: meta.url,
    seriesId: null,
  });
  await replaceCredits(album.id, [
    { photographerId: photographer.id, isCopyright: true, description: "" },
  ]);
  await clearRedirect(path);
  await touchAlbum(album.id, parent.id);
  invalidateAlbum("v4", album.id, parent.id);

  let coverImported = false;
  if (meta.imageUrl) {
    const data = await fetchCoverImage(meta.imageUrl, fetchImpl);
    if (data) {
      const added = await addPhotoToAlbum(
        { id: album.id, path, parentId: parent.id },
        viewer.userId,
        coverFilename(meta.imageUrl),
        data,
      );
      coverImported = added.ok;
    }
  }
  return { ok: true, path, coverImported };
}
