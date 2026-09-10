import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { documentTitle } from "@/components/breadcrumb";
import { GalleryPage } from "@/components/GalleryPage";
import { loadGalleryPage } from "@/gallery/load";
import { normalizeGalleryPath } from "@/gallery/paths";
import type { GalleryPageResult } from "@/gallery/types";
import { getViewer } from "@/gallery/viewer";
import { getTranslations } from "@/translations";

interface Props {
  params: Promise<{ locale: string; path?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** One load per request, shared by generateMetadata and the page. */
const getGalleryPage = cache(async (path: string) =>
  loadGalleryPage(path, await getViewer()),
);

export function galleryMetadata(
  locale: string,
  result: GalleryPageResult,
): Metadata {
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, path } = await params;
  const normalized = normalizeGalleryPath(path);
  if (!normalized || normalized.timeline) return {};
  return galleryMetadata(locale, await getGalleryPage(normalized.path));
}

export default async function CatchAllPage({ params, searchParams }: Props) {
  const { locale, path } = await params;
  const normalized = normalizeGalleryPath(path);
  if (!normalized) notFound();
  if (normalized.timeline) redirect(normalized.path);

  const result = await getGalleryPage(normalized.path);
  if (result.kind === "redirect") redirect(result.to);
  if (result.kind === "not-found") notFound();

  return (
    <GalleryPage
      locale={locale}
      viewer={await getViewer()}
      result={result}
      searchParams={await searchParams}
    />
  );
}
