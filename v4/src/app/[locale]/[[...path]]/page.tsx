import { Messages } from "@con2/components";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { AlbumViewFooter } from "@/components/AlbumViewFooter";
import { AppBar } from "@/components/AppBar";
import { BreadcrumbBar } from "@/components/BreadcrumbBar";
import { GalleryView } from "@/components/GalleryView";
import { documentTitle } from "@/components/breadcrumb";
import { EditorPanel, editorMode } from "@/components/editor/EditorPanel";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import {
  canCreateSubalbum,
  canDeleteAlbum,
  canDownload,
  canEditAlbum,
  canManagePhoto,
} from "@/gallery/access";
import { loadGalleryPage } from "@/gallery/load";
import { normalizeGalleryPath } from "@/gallery/paths";
import { getViewer } from "@/gallery/viewer";
import { getTranslations } from "@/translations";

import { deletePhoto, setAlbumThumbnail } from "./actions";

interface Props {
  params: Promise<{ locale: string; path?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** One load per request, shared by generateMetadata and the page. */
const getGalleryPage = cache(async (path: string) =>
  loadGalleryPage(path, await getViewer()),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, path } = await params;
  const normalized = normalizeGalleryPath(path);
  if (!normalized || normalized.timeline) return {};
  const result = await getGalleryPage(normalized.path);
  if (result.kind !== "ok") return {};
  const t = getTranslations(locale);
  const { album, photo } = result;
  const image =
    photo?.preview?.fallback ??
    photo?.thumbnail.fallback ??
    album.subalbums[0]?.thumbnail?.fallback;
  return {
    title: documentTitle(album, photo, t.BreadcrumbBar),
    description: album.description || album.title,
    robots:
      album.visibility === "public"
        ? undefined
        : { index: false, follow: false },
    openGraph: image
      ? {
          images: [
            { url: image.src, width: image.width, height: image.height },
          ],
        }
      : undefined,
  };
}

export default async function GalleryPage({ params, searchParams }: Props) {
  const { locale, path } = await params;
  const normalized = normalizeGalleryPath(path);
  if (!normalized) notFound();
  if (normalized.timeline) redirect(normalized.path);

  const result = await getGalleryPage(normalized.path);
  if (result.kind === "redirect") redirect(result.to);
  if (result.kind === "not-found") notFound();

  const { album, photo, unfiltered } = result;
  const t = getTranslations(locale);
  const viewer = await getViewer();
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
  const rights = {
    canCreate: canCreateSubalbum(viewer, guard),
    canEdit: canEditAlbum(viewer, guard),
    canDelete: canDeleteAlbum(viewer, guard),
  };
  const query = await searchParams;
  const mode = photo === null ? editorMode(query) : null;
  const messageParams = {
    error: typeof query.error === "string" ? query.error : undefined,
    success: typeof query.success === "string" ? query.success : undefined,
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
        messages={{
          AlbumView: t.AlbumView,
          PictureView: t.PictureView,
          BreadcrumbBar: t.BreadcrumbBar,
          DownloadDialog: t.DownloadDialog,
          Download: t.Download,
        }}
        editor={
          canManagePhoto(viewer, guard)
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
