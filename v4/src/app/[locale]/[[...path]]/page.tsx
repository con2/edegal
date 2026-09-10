import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { AlbumViewFooter } from "@/components/AlbumViewFooter";
import { AppBar } from "@/components/AppBar";
import { BreadcrumbBar } from "@/components/BreadcrumbBar";
import { GalleryView } from "@/components/GalleryView";
import { documentTitle } from "@/components/breadcrumb";
import { canDownload, canEditAlbum } from "@/gallery/access";
import { loadGalleryPage } from "@/gallery/load";
import { normalizeGalleryPath } from "@/gallery/paths";
import { getViewer } from "@/gallery/viewer";
import { getTranslations } from "@/translations";

interface Props {
  params: Promise<{ locale: string; path?: string[] }>;
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

export default async function GalleryPage({ params }: Props) {
  const { locale, path } = await params;
  const normalized = normalizeGalleryPath(path);
  if (!normalized) notFound();
  if (normalized.timeline) redirect(normalized.path);

  const result = await getGalleryPage(normalized.path);
  if (result.kind === "redirect") redirect(result.to);
  if (result.kind === "not-found") notFound();

  const { album, photo } = result;
  const t = getTranslations(locale);
  const viewer = await getViewer();
  const rootAlbum = album.breadcrumb[0] ?? {
    path: album.path,
    title: album.title,
  };

  return (
    <>
      <AppBar
        rootAlbum={rootAlbum}
        viewer={viewer}
        messages={{ AppBar: t.AppBar, Auth: t.Auth }}
      />
      {album.breadcrumb.length > 0 ? (
        <BreadcrumbBar
          album={album}
          messages={{
            BreadcrumbBar: t.BreadcrumbBar,
            Album: t.Album,
            DownloadAlbumDialog: t.DownloadAlbumDialog,
            Download: t.Download,
          }}
          canDownload={
            canDownload(album) && album.photos.some((p) => p.original !== null)
          }
          canEdit={
            album.legacyAdminUrl !== null
              ? viewer.kind === "user" && viewer.isPhotographer
              : canEditAlbum(viewer, { source: album.source, ownerId: null })
          }
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
      />
      <AlbumViewFooter album={album} messages={t.AlbumViewFooter} />
    </>
  );
}
