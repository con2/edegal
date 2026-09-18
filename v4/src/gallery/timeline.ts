import { legacyTimelinePhotos } from "@/legacy/provider";

import { finishGalleryPage, loadResolved, presentAlbumPage } from "./load";
import { resolveRedirect } from "./redirects";
import { resolvePath } from "./resolve";
import type { AlbumPageVM, GalleryPageResult, PhotoVM } from "./types";
import { v4TimelinePhotos } from "./v4/provider";
import type { Viewer } from "./viewer";

/**
 * Turns a normal album page into its timeline: no subalbum tiles (everything is flattened into
 * `photos` instead), no per-album prose or series links (they'd describe one album, not the
 * flattened subtree), and no "still processing" count (it isn't tracked per photo here).
 */
export function timelineVM(shell: AlbumPageVM, photos: PhotoVM[]): AlbumPageVM {
  return {
    ...shell,
    kind: "timeline",
    body: { ...shell.body, text: "" },
    subalbums: [],
    photos,
    hasManualOrdering: false,
    photosProcessing: 0,
    previousInSeries: null,
    nextInSeries: null,
  };
}

/**
 * The `?timeline` view of an album: every photo from it and all its descendant subalbums, any
 * depth, flattened and sorted by capture time. Falls back to the normal page (via
 * `finishGalleryPage`, sharing the exact not-found/redirect/visibility handling `loadGalleryPage`
 * uses) whenever a timeline would not make sense:
 * - the path did not resolve to a single album (a series page, or nothing at all),
 * - the album is the site root, where a timeline would scan the entire gallery across both
 *   content sources at once,
 * - the album itself redirects elsewhere, or
 * - the request named a specific photo that has no capture time (or no thumbnail yet) and so was
 *   dropped from the flattened list - it still exists, just not on this page.
 */
export async function loadTimelinePage(
  path: string,
  viewer: Viewer,
): Promise<GalleryPageResult> {
  const resolution = await resolvePath(path);
  if (!resolution) {
    const target = await resolveRedirect(path);
    return target ? { kind: "redirect", to: target } : { kind: "not-found" };
  }

  const shell = await loadResolved(resolution);
  const photoPath = resolution.kind === "photo" ? resolution.photoPath : null;

  if (
    !shell ||
    shell.kind !== "album" ||
    shell.path === "/" ||
    shell.redirectUrl
  ) {
    return finishGalleryPage(resolution, shell, viewer, path);
  }

  const photos =
    shell.source === "v4"
      ? await v4TimelinePhotos(shell)
      : await legacyTimelinePhotos(Number(shell.id));

  if (photoPath !== null && !photos.some((p) => p.path === photoPath)) {
    return finishGalleryPage(resolution, shell, viewer, path);
  }

  return presentAlbumPage(timelineVM(shell, photos), viewer, path, photoPath);
}
