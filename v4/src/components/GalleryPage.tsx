import { Messages } from "@con2/components";

import {
  canCreateSubalbum,
  canDeleteAlbum,
  canDownload,
  canEditAlbum,
  canManagePhoto,
} from "@/gallery/access";
import type { GalleryPageResult } from "@/gallery/types";
import type { Viewer } from "@/gallery/viewer";
import { getTranslations } from "@/translations";

import {
  deletePhoto,
  setAlbumThumbnail,
} from "@/app/[locale]/[[...path]]/actions";

import { AlbumViewFooter } from "./AlbumViewFooter";
import { AppBar } from "./AppBar";
import { BreadcrumbBar } from "./BreadcrumbBar";
import { EditorPanel, editorMode } from "./editor/EditorPanel";
import { EditorToolbar } from "./editor/EditorToolbar";
import { GalleryView } from "./GalleryView";

interface GalleryPageProps {
  locale: string;
  viewer: Viewer;
  result: Extract<GalleryPageResult, { kind: "ok" }>;
  searchParams: Record<string, string | string[] | undefined>;
}

/** The whole gallery page for an album-shaped view-model; shared by the catch-all and the photographer routes. */
export function GalleryPage({
  locale,
  viewer,
  result,
  searchParams,
}: GalleryPageProps) {
  const { album, photo, unfiltered } = result;
  const t = getTranslations(locale);
  const rootAlbum = album.breadcrumb[0] ?? {
    path: album.path,
    title: album.title,
  };
  const guard = {
    source: album.source,
    ownerId: unfiltered.ownerId,
    isOpenForSubalbums: unfiltered.isOpenForSubalbums,
    path: album.path,
  };
  const isAlbum = unfiltered.kind === "album";
  const rights = {
    canCreate: isAlbum && canCreateSubalbum(viewer, guard),
    canEdit: isAlbum && canEditAlbum(viewer, guard),
    canDelete: isAlbum && canDeleteAlbum(viewer, guard),
  };
  const mode = photo === null ? editorMode(searchParams) : null;
  const messageParams = {
    error:
      typeof searchParams.error === "string" ? searchParams.error : undefined,
    success:
      typeof searchParams.success === "string"
        ? searchParams.success
        : undefined,
  };

  return (
    <>
      <AppBar
        rootAlbum={rootAlbum}
        viewer={viewer}
        locale={locale}
        messages={{
          AppBar: t.AppBar,
          Auth: t.Auth,
          LanguageSwitcher: t.LanguageSwitcher,
        }}
      />
      {album.breadcrumb.length > 0 || rights.canCreate || rights.canEdit ? (
        <BreadcrumbBar
          album={album}
          messages={{
            BreadcrumbBar: t.BreadcrumbBar,
            Album: t.Album,
            DownloadAlbumDialog: t.DownloadAlbumDialog,
            Download: t.Download,
          }}
          canEdit={
            album.legacyAdminUrl !== null &&
            viewer.kind === "user" &&
            viewer.isPhotographer
          }
          canDownload={
            canDownload(album) && album.photos.some((p) => p.original !== null)
          }
          editor={
            rights.canCreate || rights.canEdit ? (
              <EditorToolbar
                locale={locale}
                albumId={album.id}
                albumPath={album.path}
                rights={rights}
                hasPhotos={album.photos.length > 0}
                hasManualOrdering={album.hasManualOrdering}
                messages={t.Editor}
              />
            ) : null
          }
        />
      ) : null}
      {messageParams.error || messageParams.success ? (
        <div className="container mt-3">
          <Messages
            searchParams={messageParams}
            messages={{ ...t.Editor.errors, ...t.Editor.success }}
          />
        </div>
      ) : null}
      {rights.canEdit && album.photosProcessing > 0 && mode !== "upload" ? (
        <div className="container mt-3 text-muted">
          {album.photosProcessing} {t.Editor.processing}
        </div>
      ) : null}
      {mode ? (
        <EditorPanel
          mode={mode}
          locale={locale}
          album={unfiltered}
          viewer={viewer}
          messages={{ Editor: t.Editor, Upload: t.Upload }}
        />
      ) : null}
      <GalleryView
        album={album}
        initialPath={photo?.path ?? album.path}
        editing={mode !== null}
        messages={{
          AlbumView: t.AlbumView,
          PictureView: t.PictureView,
          BreadcrumbBar: t.BreadcrumbBar,
          DownloadDialog: t.DownloadDialog,
          Download: t.Download,
        }}
        editor={
          isAlbum && canManagePhoto(viewer, guard)
            ? {
                setThumbnail: setAlbumThumbnail.bind(null, locale),
                deletePhoto: deletePhoto.bind(null, locale),
                messages: t.Editor,
              }
            : null
        }
      />
      <AlbumViewFooter album={album} messages={t.AlbumViewFooter} />
    </>
  );
}
