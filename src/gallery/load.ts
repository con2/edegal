import { defaultLanguage } from "@/i18n/locales";
import { withEventMetadataBody } from "@/integrations/larpit/body";

import { canView } from "./access";
import { albumVersion, loadAlbum } from "./album";
import { cachedAlbum } from "./cache";
import { lastSegment } from "./paths";
import { resolveRedirect } from "./redirects";
import { resolvePath } from "./resolve";
import { loadSeriesPageBySlug, seriesVersion } from "./series";
import type { AlbumPageVM, GalleryPageResult, Resolution } from "./types";
import type { Viewer } from "./viewer";
import { applyVisibility } from "./visibility";

/**
 * The cached, unfiltered album page, with a Larpit.fi-synthesized body applied afterwards - that
 * synthesis has its own TTL, so it is not frozen into the cached VM itself (see `@/integrations/larpit/body.ts`).
 */
export async function loadResolved(
  resolution: Resolution,
  locale: string = defaultLanguage,
): Promise<AlbumPageVM | null> {
  let vm: AlbumPageVM | null;
  if (resolution.kind === "series") {
    const slug = lastSegment(resolution.path);
    const version = await seriesVersion(slug);
    vm = await cachedAlbum(
      `series:${slug}`,
      () => loadSeriesPageBySlug(slug),
      version,
    );
  } else {
    const { albumId } = resolution;
    // One tiny query decides whether the cached page is still current; the media worker and every
    // mutation bump updated_at.
    const version = await albumVersion(albumId);
    if (version === null) return null;
    vm = await cachedAlbum(albumId, () => loadAlbum(albumId), version);
  }
  return vm ? withEventMetadataBody(vm, locale) : null;
}

export async function loadGalleryPage(
  path: string,
  viewer: Viewer,
  locale: string = defaultLanguage,
): Promise<GalleryPageResult> {
  const resolution = await resolvePath(path);
  if (!resolution) {
    const target = await resolveRedirect(path);
    return target ? { kind: "redirect", to: target } : { kind: "not-found" };
  }

  const loaded = await loadResolved(resolution, locale);
  return finishGalleryPage(resolution, loaded, viewer, path);
}

/**
 * The tail shared by the normal and timeline loaders once each has its own (possibly null)
 * `AlbumPageVM`: the not-found/redirect checks and applying the viewer's visibility.
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

  return presentAlbumPage(
    loaded,
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
