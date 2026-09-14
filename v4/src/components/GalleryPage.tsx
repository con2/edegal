import { Messages } from "@con2/components";

import {
  canCreateSubalbum,
  canDeleteAlbum,
  canDownload,
  canEditAlbum,
  canManagePhoto,
  canManageSeries,
} from "@/gallery/access";
import { thumbnailTargets } from "@/editor/albums";
import type { GalleryPageResult } from "@/gallery/types";
import type { Viewer } from "@/gallery/viewer";
import { getTranslations } from "@/translations";

import {
  deletePhoto,
  setAlbumThumbnail,
  setProfilePhoto,
} from "@/app/[locale]/[[...path]]/actions";

import { AlbumViewFooter } from "./AlbumViewFooter";
import { AppBar } from "./AppBar";
import { BreadcrumbBar } from "./BreadcrumbBar";
import { EditorPanel, editorMode } from "./editor/EditorPanel";
import { EditorToolbar } from "./editor/EditorToolbar";
import { GalleryView } from "./GalleryView";
import type { PhotoEditor } from "./PictureView";

interface GalleryPageProps {
  locale: string;
  viewer: Viewer;
  result: Extract<GalleryPageResult, { kind: "ok" }>;
  searchParams: Record<string, string | string[] | undefined>;
}

/** The whole gallery page for an album-shaped view-model; shared by the catch-all and the photographer routes. */
export async function GalleryPage({
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
  const isV4Series = unfiltered.kind === "series" && album.source === "v4";
  const manageSeries = isV4Series && canManageSeries(viewer);
  const rights = {
    canCreate: isAlbum && canCreateSubalbum(viewer, guard),
    canEdit: (isAlbum && canEditAlbum(viewer, guard)) || manageSeries,
    canDelete: (isAlbum && canDeleteAlbum(viewer, guard)) || manageSeries,
    canCreateSeries: isAlbum && album.path === "/" && canManageSeries(viewer),
  };
  const requestedMode = photo === null ? editorMode(searchParams) : null;
  const modeAllowed = {
    new: rights.canCreate,
    edit: rights.canEdit,
    upload: isAlbum && rights.canEdit,
    delete: rights.canDelete,
    newSeries: rights.canCreateSeries,
    importFlickr: rights.canCreate,
  };
  const mode =
    requestedMode && modeAllowed[requestedMode] ? requestedMode : null;
  const canManage = isAlbum && canManagePhoto(viewer, guard);
  const canPickProfilePhoto =
    isAlbum &&
    album.source === "v4" &&
    viewer.kind === "user" &&
    viewer.isPhotographer;
  const targets =
    isAlbum && album.source === "v4" && viewer.kind === "user"
      ? await thumbnailTargets(viewer, {
          id: album.id,
          path: album.path,
          ownerId: unfiltered.ownerId,
          title: album.title,
        })
      : [];
  const photoEditor: PhotoEditor | null =
    canManage || canPickProfilePhoto || targets.length > 0
      ? {
          thumbnailTargets: targets,
          setThumbnail: setAlbumThumbnail.bind(null, locale),
          manage: canManage
            ? { deletePhoto: deletePhoto.bind(null, locale) }
            : null,
          setProfilePhoto: canPickProfilePhoto
            ? setProfilePhoto.bind(null, locale)
            : null,
          messages: t.Editor,
        }
      : null;
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
      {album.breadcrumb.length > 0 ||
      rights.canCreate ||
      rights.canEdit ||
      rights.canCreateSeries ? (
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
            rights.canCreate || rights.canEdit || rights.canCreateSeries ? (
              <EditorToolbar
                locale={locale}
                albumId={album.id}
                albumPath={album.path}
                kind={isV4Series ? "series" : "album"}
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
          PhotographerProfile: t.PhotographerProfile,
          PictureView: t.PictureView,
          BreadcrumbBar: t.BreadcrumbBar,
          DownloadDialog: t.DownloadDialog,
          Download: t.Download,
          ContactDialog: t.ContactDialog,
        }}
        editor={photoEditor}
      />
      <AlbumViewFooter album={album} messages={t.AlbumViewFooter} />
    </>
  );
}
