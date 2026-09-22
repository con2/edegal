import type { Metadata } from "next";
import { cache } from "react";

import { GalleryPage } from "@/components/GalleryPage";
import { presentAlbumPage } from "@/gallery/load";
import { galleryMetadata } from "@/gallery/metadata";
import { loadPhotographersIndex } from "@/gallery/photographers";
import { getViewer } from "@/gallery/viewer";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const getPage = cache(async () =>
  presentAlbumPage(
    await loadPhotographersIndex(),
    await getViewer(),
    "/photographers",
    null,
  ),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return galleryMetadata(locale, await getPage());
}

/** Every photographer with something to show, as an album-shaped grid. */
export default async function PhotographersPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const result = await getPage();
  if (result.kind !== "ok") return null;
  return (
    <GalleryPage
      locale={locale}
      viewer={await getViewer()}
      result={result}
      searchParams={await searchParams}
    />
  );
}
