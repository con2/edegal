import { legacyEnabled } from "@/config";
import { loadLegacyAlbum } from "@/legacy/provider";
import { legacyAlbumByPath } from "@/legacy/sql";

import { canView } from "./access";
import { cachedAlbum } from "./cache";
import { lastSegment } from "./paths";
import { resolveRedirect } from "./redirects";
import { resolvePath } from "./resolve";
import { loadSeriesPageBySlug, seriesVersion } from "./series";
import type {
  AlbumPageVM,
  GalleryPageResult,
  Resolution,
  SubalbumVM,
} from "./types";
import { loadV4Album, v4AlbumVersion } from "./v4/provider";
import type { Viewer } from "./viewer";
import { applyVisibility } from "./visibility";

export async function loadResolved(
  resolution: Resolution,
): Promise<AlbumPageVM | null> {
  if (resolution.kind === "series") {
    // One page per slug whichever table matched; a v4 row's updated_at versions it.
    const slug = lastSegment(resolution.path);
    return cachedAlbum(
      "v4",
      `series:${slug}`,
      () => loadSeriesPageBySlug(slug),
      await seriesVersion(slug),
    );
  }
  const { source, albumId } = resolution;
  if (source === "legacy") {
    return cachedAlbum("legacy", albumId, () =>
      loadLegacyAlbum(Number(albumId)),
    );
  }
  // One tiny query decides whether the cached page is still current; the media worker and every
  // mutation bump updated_at.
  const version = await v4AlbumVersion(albumId);
  if (version === null) return null;
  return cachedAlbum("v4", albumId, () => loadV4Album(albumId), version);
}

function compareSubalbums(
  a: SubalbumVM & { ordering?: number },
  b: SubalbumVM & { ordering?: number },
): number {
  if (a.date === b.date) return 0;
  if (a.date === null) return 1;
  if (b.date === null) return -1;
  return a.date < b.date ? 1 : -1;
}

/**
 * Both the v4 root album and the legacy root album have path `/`. The v4 one wins resolution, and
 * its listing is extended with the legacy root's subalbums so visitors see one front page.
 */
async function withLegacyRootSubalbums(
  root: AlbumPageVM,
): Promise<AlbumPageVM> {
  if (!legacyEnabled || root.source !== "v4" || root.path !== "/") return root;
  const legacyRoot = await legacyAlbumByPath("/");
  if (!legacyRoot) return root;
  const legacy = await cachedAlbum("legacy", String(legacyRoot.id), () =>
    loadLegacyAlbum(legacyRoot.id),
  );
  if (!legacy) return root;
  const v4Paths = new Set(root.subalbums.map((s) => s.path));
  const legacyOnly = legacy.subalbums.filter((s) => !v4Paths.has(s.path));
  return {
    ...root,
    body: root.body.text.trim() ? root.body : legacy.body,
    subalbums: [...root.subalbums, ...legacyOnly].sort(compareSubalbums),
  };
}

export async function loadGalleryPage(
  path: string,
  viewer: Viewer,
): Promise<GalleryPageResult> {
  const resolution = await resolvePath(path);
  if (!resolution) {
    const target = await resolveRedirect(path);
    return target ? { kind: "redirect", to: target } : { kind: "not-found" };
  }

  const loaded = await loadResolved(resolution);
  return finishGalleryPage(resolution, loaded, viewer, path);
}

/**
 * The tail shared by the normal and timeline loaders once each has its own (possibly null)
 * `AlbumPageVM`: the not-found/redirect checks, the legacy-root subalbum merge, and applying the
 * viewer's visibility.
 */
export async function finishGalleryPage(
  resolution: Resolution,
  loaded: AlbumPageVM | null,
  viewer: Viewer,
  path: string,
): Promise<GalleryPageResult> {
  if (!loaded) return { kind: "not-found" };
  if (resolution.kind === "album" && loaded.redirectUrl) {
    // A redirect reveals the album exists and where it went; private albums keep that to staff.
    if (!canView(viewer, loaded)) return { kind: "not-found" };
    return { kind: "redirect", to: loaded.redirectUrl };
  }

  const merged = await withLegacyRootSubalbums(loaded);
  return presentAlbumPage(
    merged,
    viewer,
    path,
    resolution.kind === "photo" ? resolution.photoPath : null,
  );
}

/** Applies the viewer's visibility to a loaded page and picks the requested photo, if any. */
export function presentAlbumPage(
  vm: AlbumPageVM,
  viewer: Viewer,
  requestedPath: string,
  photoPath: string | null,
): GalleryPageResult {
  const album = applyVisibility(vm, viewer);
  if (!album) return { kind: "not-found" };
  if (photoPath !== null) {
    const photo = album.photos.find((p) => p.path === photoPath) ?? null;
    if (!photo) return { kind: "not-found" };
    return { kind: "ok", album, unfiltered: vm, requestedPath, photo };
  }
  return { kind: "ok", album, unfiltered: vm, requestedPath, photo: null };
}
