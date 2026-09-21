import type { Visibility } from "./types";
import type { Viewer } from "./viewer";

interface Guarded {
  visibility: Visibility;
  ownerId: string | null;
}

const restrictiveness: Record<Visibility, number> = {
  public: 0,
  hidden: 1,
  private: 2,
};

/**
 * An album is as visible to the rest of the site as its least visible ancestor: a public album
 * inside a hidden one is hidden from photographer pages, series, random and search engines, and
 * one inside a private album is private.
 */
export function mostRestrictive(visibilities: Visibility[]): Visibility {
  return visibilities.reduce(
    (worst, v) => (restrictiveness[v] > restrictiveness[worst] ? v : worst),
    "public",
  );
}

export function owns(viewer: Viewer, ownerId: string | null): boolean {
  return (
    viewer.kind === "user" && ownerId !== null && ownerId === viewer.userId
  );
}

/** Private content is visible to its owner and admins. */
export function canView(viewer: Viewer, item: Guarded): boolean {
  if (item.visibility !== "private") return true;
  return (
    owns(viewer, item.ownerId) || (viewer.kind === "user" && viewer.isAdmin)
  );
}

/** Hidden content is reachable by URL for everyone but listed only for those who could edit it. */
export function canList(viewer: Viewer, item: Guarded): boolean {
  if (item.visibility === "public") return true;
  if (item.visibility === "private") return canView(viewer, item);
  return (
    owns(viewer, item.ownerId) || (viewer.kind === "user" && viewer.isAdmin)
  );
}

/** A non-public photo is shown to whoever could list a non-public album with the same owner. */
export function canSeePhoto(
  viewer: Viewer,
  album: { ownerId: string | null },
  photoVisibility: Visibility,
): boolean {
  return canList(viewer, { ...album, visibility: photoVisibility });
}

export function canEditAlbum(
  viewer: Viewer,
  album: { ownerId: string | null },
): boolean {
  if (viewer.kind !== "user") return false;
  return viewer.isAdmin || owns(viewer, album.ownerId);
}

export function canCreateSubalbum(
  viewer: Viewer,
  album: {
    ownerId: string | null;
    isOpenForSubalbums: boolean;
  },
): boolean {
  if (viewer.kind !== "user" || !viewer.isPhotographer) return false;
  return (
    viewer.isAdmin || owns(viewer, album.ownerId) || album.isOpenForSubalbums
  );
}

/** Downloads of originals and album zips; visibility is enforced separately by loadGalleryPage. */
export function canDownload(album: { isDownloadable: boolean }): boolean {
  return album.isDownloadable;
}

/** Uploading into an album is the same right as editing it. */
export const canUpload = canEditAlbum;

/** Deleting or changing a photo follows its album. */
export const canManagePhoto = canEditAlbum;

/** The root album is never deleted. */
export function canDeleteAlbum(
  viewer: Viewer,
  album: { ownerId: string | null; path: string },
): boolean {
  return album.path !== "/" && canEditAlbum(viewer, album);
}

/** Series group albums across photographers, so only admins shape them. */
export function canManageSeries(viewer: Viewer): boolean {
  return viewer.kind === "user" && viewer.isAdmin;
}
