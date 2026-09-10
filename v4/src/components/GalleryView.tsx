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

  const navigate = useCallback((path: string, mode: "push" | "replace") => {
    if (mode === "push") window.history.pushState(null, "", path);
    else window.history.replaceState(null, "", path);
  }, []);

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
