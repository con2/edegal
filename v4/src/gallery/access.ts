import type { ContentSource, Visibility } from "./types";
import type { Viewer } from "./viewer";

interface Guarded {
  source: ContentSource;
  visibility: Visibility;
  ownerId: string | null;
}

/** Django gave both the editor and the admin group `is_staff`, which sees everything. */
export function isStaff(viewer: Viewer): boolean {
  return viewer.kind === "user" && (viewer.isAdmin || viewer.isPhotographer);
}

export function owns(viewer: Viewer, ownerId: string | null): boolean {
  return (
    viewer.kind === "user" && ownerId !== null && ownerId === viewer.userId
  );
}

/** Private content is visible to its owner and admins (any staff for legacy content). */
export function canView(viewer: Viewer, item: Guarded): boolean {
  if (item.visibility !== "private") return true;
  if (item.source === "legacy") return isStaff(viewer);
  return (
    owns(viewer, item.ownerId) || (viewer.kind === "user" && viewer.isAdmin)
  );
}

/** Hidden content is reachable by URL for everyone but listed only for those who could edit it. */
export function canList(viewer: Viewer, item: Guarded): boolean {
  if (item.visibility === "public") return true;
  if (item.visibility === "private") return canView(viewer, item);
  if (item.source === "legacy") return isStaff(viewer);
  return (
    owns(viewer, item.ownerId) || (viewer.kind === "user" && viewer.isAdmin)
  );
}

/**
 * A non-public photo is shown to whoever could list a non-public album with the same owner:
 * staff for legacy content, the owner and admins for v4 content.
 */
export function canSeePhoto(
  viewer: Viewer,
  album: { source: ContentSource; ownerId: string | null },
  photoVisibility: Visibility,
): boolean {
  return canList(viewer, { ...album, visibility: photoVisibility });
}

export function canEditAlbum(
  viewer: Viewer,
  album: { source: ContentSource; ownerId: string | null },
): boolean {
  if (album.source === "legacy" || viewer.kind !== "user") return false;
  return viewer.isAdmin || owns(viewer, album.ownerId);
}

export function canCreateSubalbum(
  viewer: Viewer,
  album: {
    source: ContentSource;
    ownerId: string | null;
    isOpenForSubalbums: boolean;
  },
): boolean {
  if (
    album.source === "legacy" ||
    viewer.kind !== "user" ||
    !viewer.isPhotographer
  )
    return false;
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
  album: { source: ContentSource; ownerId: string | null; path: string },
): boolean {
  return album.path !== "/" && canEditAlbum(viewer, album);
}

/** Series group albums across photographers, so only admins shape them. */
export function canManageSeries(viewer: Viewer): boolean {
  return viewer.kind === "user" && viewer.isAdmin;
}
