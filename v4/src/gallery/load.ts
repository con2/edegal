import { legacyEnabled } from "@/config";
import { loadLegacyAlbum, loadLegacySeries } from "@/legacy/provider";
import { resolveLegacyUpstreamRedirect } from "@/legacy/redirects";
import { legacyAlbumByPath } from "@/legacy/sql";

import { cachedAlbum } from "./cache";
import { resolvePath } from "./resolve";
import type {
  AlbumPageVM,
  GalleryPageResult,
  Resolution,
  SubalbumVM,
} from "./types";
import { loadV4Album, v4AlbumVersion } from "./v4/provider";
import type { Viewer } from "./viewer";
import { applyVisibility } from "./visibility";

async function loadResolved(
  resolution: Resolution,
): Promise<AlbumPageVM | null> {
  if (resolution.kind === "series") {
    return cachedAlbum("legacy", `series:${resolution.seriesId}`, () =>
      loadLegacySeries(resolution.seriesId),
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
    subalbums: [...root.subalbums, ...legacyOnly].sort(compareSubalbums),
  };
}

export async function loadGalleryPage(
  path: string,
  viewer: Viewer,
): Promise<GalleryPageResult> {
  const resolution = await resolvePath(path);
  if (!resolution) {
    const target = legacyEnabled
      ? await resolveLegacyUpstreamRedirect(path)
      : null;
    return target ? { kind: "redirect", to: target } : { kind: "not-found" };
  }

  const loaded = await loadResolved(resolution);
  if (!loaded) return { kind: "not-found" };
  if (resolution.kind === "album" && loaded.redirectUrl)
    return { kind: "redirect", to: loaded.redirectUrl };

  const merged = await withLegacyRootSubalbums(loaded);
  const album = applyVisibility(merged, viewer);
  if (!album) return { kind: "not-found" };

  if (resolution.kind === "photo") {
    const photo =
      album.photos.find((p) => p.path === resolution.photoPath) ?? null;
    if (!photo) return { kind: "not-found" };
    return {
      kind: "ok",
      album,
      unfiltered: merged,
      requestedPath: path,
      photo,
    };
  }
  return {
    kind: "ok",
    album,
    unfiltered: merged,
    requestedPath: path,
    photo: null,
  };
}
