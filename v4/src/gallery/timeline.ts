import { db } from "@/prisma/db";

import { effectiveVisibilities } from "./effectiveVisibility";
import type { CreditRow } from "./credit";
import { creditVM, isContactable } from "./credit";
import { photoVM } from "./media";
import { isAncestorOrSelf } from "./paths";
import { finishGalleryPage, loadResolved, presentAlbumPage } from "./load";
import { resolveRedirect } from "./redirects";
import { resolvePath } from "./resolve";
import type { AlbumPageVM, GalleryPageResult, PhotoVM } from "./types";
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
    body: "",
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
 * depth, flattened and sorted by capture time.
 *
 * `timelineParam` is the raw `?timeline` query value: `""` for a bare flag (the root is whichever
 * album `path` itself resolves to), or an explicit album path - needed because a photo opened from
 * within a timeline no longer sits at the root, and its own path alone cannot say which ancestor's
 * timeline it was reached from (it could be its own direct album, or any ancestor's).
 *
 * Falls back to the normal page (via `finishGalleryPage`, sharing the exact not-found/redirect/
 * visibility handling `loadGalleryPage` uses) whenever a timeline would not make sense:
 * - the path did not resolve to a single album (a series page, or nothing at all),
 * - an explicit root does not resolve to an album, or does not actually contain `path`,
 * - the resolved root is the site root, where a timeline would scan the entire gallery at once,
 * - the root album redirects elsewhere, or
 * - the request named a specific photo that has no capture time (or no thumbnail yet) and so was
 *   dropped from the flattened list - it still exists, just not on this page.
 */
export async function loadTimelinePage(
  path: string,
  viewer: Viewer,
  timelineParam: string,
): Promise<GalleryPageResult> {
  const resolution = await resolvePath(path);
  if (!resolution) {
    const target = await resolveRedirect(path);
    return target ? { kind: "redirect", to: target } : { kind: "not-found" };
  }

  const shell = await loadResolved(resolution);
  const photoPath = resolution.kind === "photo" ? resolution.photoPath : null;
  const fallback = () => finishGalleryPage(resolution, shell, viewer, path);

  if (!shell || shell.kind !== "album" || shell.redirectUrl) return fallback();

  let root = shell;
  if (timelineParam !== "" && timelineParam !== shell.path) {
    const rootResolution = await resolvePath(timelineParam);
    const rootShell =
      rootResolution && rootResolution.kind === "album"
        ? await loadResolved(rootResolution)
        : null;
    // A tampered or stale `?timeline=<root>` link (wrong path, or one that doesn't actually
    // contain the requested page) falls back to the normal page rather than guessing a root.
    if (
      !rootShell ||
      rootShell.kind !== "album" ||
      !isAncestorOrSelf(rootShell.path, path)
    ) {
      return fallback();
    }
    root = rootShell;
  }

  // Applies to the resolved root regardless of how it was named: a timeline at the site root
  // would scan the entire gallery at once.
  if (root.path === "/") return fallback();

  const photos = await timelinePhotos(root);

  if (photoPath !== null && !photos.some((p) => p.path === photoPath)) {
    return fallback();
  }

  return presentAlbumPage(timelineVM(root, photos), viewer, path, photoPath);
}

/**
 * Every photo in an album's subtree (the album itself and all descendants, any depth),
 * chronologically ordered. Each photo carries the effective visibility, owner, and
 * credits/contact/download settings of the album that actually contains it, since a timeline
 * flattens in photos from several albums that need not share any of those.
 *
 * The requested album's own direct photos are always treated as visible, matching how its normal
 * page already works (an album's own effective visibility gates whether the *page* is reachable
 * at all, not its own photos once you're on it) - only *descendants* pulled into the listing are
 * gated by their own effective visibility, the same way a subalbum tile is.
 */
async function timelinePhotos(album: {
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
    const vm = photoVM(photo, visibility, owningAlbum.ownerId);
    if (!vm) return [];
    const credits = creditsByAlbum.get(owningAlbum.id) ?? [];
    return [
      {
        ...vm,
        credits: credits.map(creditVM),
        contactable: isContactable(credits),
        isDownloadable: owningAlbum.isDownloadable,
      },
    ];
  });
}
