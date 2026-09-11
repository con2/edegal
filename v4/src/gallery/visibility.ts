import { canList, canSeePhoto, canView } from "./access";
import type { AlbumPageVM, ClientAlbumPage } from "./types";
import type { Viewer } from "./viewer";

/**
 * Applies the viewer's visibility to a cached, unfiltered album page and strips server-only
 * fields. Returns null when the viewer may not see the album at all.
 */
export function applyVisibility(
  vm: AlbumPageVM,
  viewer: Viewer,
): ClientAlbumPage | null {
  if (!canView(viewer, vm)) return null;
  const {
    ownerId: _ownerId,
    parentId: _parentId,
    isOpenForSubalbums: _open,
    subalbums,
    photos,
    ...rest
  } = vm;
  return {
    ...rest,
    subalbums: subalbums
      .filter((s) =>
        canList(viewer, {
          source: vm.source,
          visibility: s.visibility,
          ownerId: s.ownerId,
        }),
      )
      .map(({ ownerId: _o, ...s }) => s),
    photos: photos.filter((p) => canSeePhoto(viewer, vm, p.visibility)),
  };
}
