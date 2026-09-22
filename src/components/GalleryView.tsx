"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";

import type { ClientAlbumPage } from "@/gallery/types";
import type { Translations } from "@/translations";

import { AlbumView } from "./AlbumView";
import { documentTitle } from "./breadcrumb";
import { type PhotoEditor, PictureView } from "./PictureView";

interface GalleryViewProps {
  album: ClientAlbumPage;
  /** The URL the server rendered: the album path or one of its photo paths. */
  initialPath: string;
  messages: Pick<
    Translations,
    | "AlbumView"
    | "PhotographerProfile"
    | "PictureView"
    | "BreadcrumbBar"
    | "DownloadDialog"
    | "Download"
    | "ContactDialog"
  >;
  editor: PhotoEditor | null;
  /** True while an editor panel is shown above the grid. */
  editing?: boolean;
}

/**
 * Switches between the album grid and the picture view purely on the client. Moving between
 * photos of one album uses the History API, which Next integrates with `usePathname`, so no
 * request reaches the server until the visitor leaves the album.
 */
export function GalleryView({
  album,
  initialPath,
  messages,
  editor,
  editing = false,
}: GalleryViewProps) {
  const pathname = usePathname();
  const belongsToAlbum =
    pathname === album.path || album.photos.some((p) => p.path === pathname);
  const currentPath = belongsToAlbum ? pathname : initialPath;

  const navigate = useCallback(
    (path: string, mode: "push" | "replace") => {
      const [pathname, query] = path.split("?");
      // Browsing a timeline survives every navigation within it - opening a photo, arrow keys,
      // swiping, toggling slideshow, going back to the album - unless the caller already named a
      // different one explicitly. Comparisons below use `pathname`, not `path`, so this can never
      // affect the scroll-restoring `history.back()` case just below.
      const url =
        album.kind === "timeline" && !/(?:^|&)timeline=/.test(query ?? "")
          ? `${pathname}?${query ? `${query}&` : ""}timeline=${encodeURIComponent(album.path)}`
          : path;

      // Only our own key is passed on: Next treats a state object carrying its internal
      // marker as its own call and skips the router sync that updates `usePathname`.
      const openedFromAlbum = Boolean(window.history.state?.openedFromAlbum);
      if (mode === "replace") {
        window.history.replaceState({ openedFromAlbum }, "", url);
        return;
      }
      // Closing a photo that was opened from this album's grid goes back in history, so the
      // browser restores the grid's scroll position as it does for the back button.
      if (pathname === album.path && openedFromAlbum) {
        window.history.back();
        return;
      }
      window.history.pushState(
        { openedFromAlbum: pathname !== album.path },
        "",
        url,
      );
    },
    [album.path, album.kind],
  );

  const index = album.photos.findIndex((p) => p.path === currentPath);
  const photo = index >= 0 ? album.photos[index] : null;

  useEffect(() => {
    document.title = documentTitle(album, photo, messages.BreadcrumbBar);
  }, [album, photo, messages.BreadcrumbBar]);

  if (photo) {
    return (
      <PictureView
        album={album}
        index={index}
        messages={{
          PictureView: messages.PictureView,
          DownloadDialog: messages.DownloadDialog,
          Download: messages.Download,
          ContactDialog: messages.ContactDialog,
        }}
        onNavigate={navigate}
        editor={editor}
      />
    );
  }
  return (
    <AlbumView
      album={album}
      messages={{
        AlbumView: messages.AlbumView,
        PhotographerProfile: messages.PhotographerProfile,
      }}
      onOpenPhoto={(path) => navigate(path, "push")}
      hideBody={editing}
    />
  );
}
