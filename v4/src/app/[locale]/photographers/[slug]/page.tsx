import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { GalleryPage } from "@/components/GalleryPage";
import { loadGalleryPage, presentAlbumPage } from "@/gallery/load";
import { loadPhotographerPageBySlug } from "@/gallery/photographers";
import { getViewer } from "@/gallery/viewer";

import { galleryMetadata } from "../../[[...path]]/page";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * A photographer's page. When no photographer has the slug, the path may still be an ordinary
 * (legacy) album under /photographers, so fall back to the gallery resolution.
 */
const getPage = cache(async (slug: string) => {
  const viewer = await getViewer();
  const path = `/photographers/${slug}`;
  if (!/^[a-z0-9-]+$/.test(slug)) return { kind: "not-found" as const };
  const photographer = await loadPhotographerPageBySlug(slug);
  if (photographer) return presentAlbumPage(photographer, viewer, path, null);
  return loadGalleryPage(path, viewer);
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return galleryMetadata(locale, await getPage(slug));
}

export default async function PhotographerPage({
  params,
  searchParams,
}: Props) {
  const { locale, slug } = await params;
  const result = await getPage(slug);
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
