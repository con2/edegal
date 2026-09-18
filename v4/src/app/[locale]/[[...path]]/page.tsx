import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { GalleryPage } from "@/components/GalleryPage";
import { loadGalleryPage } from "@/gallery/load";
import { galleryMetadata } from "@/gallery/metadata";
import { normalizeGalleryPath } from "@/gallery/paths";
import { loadTimelinePage } from "@/gallery/timeline";
import { getViewer } from "@/gallery/viewer";

interface Props {
  params: Promise<{ locale: string; path?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * There is no UI for it yet, but appending `?timeline` to an album's URL flattens it and every
 * descendant subalbum's photos into one chronologically sorted view. `null` means the request
 * named no timeline at all; `""` is a bare `?timeline` (the root is whichever album the path
 * itself resolves to); any other string names an explicit ancestor's root, needed once a photo
 * inside a timeline no longer sits at that root itself.
 */
function timelineParam(
  searchParams: Record<string, string | string[] | undefined>,
): string | null {
  const value = searchParams.timeline;
  if (value === undefined) return null;
  return Array.isArray(value) ? (value[0] ?? "") : value;
}

/** One load per request, shared by generateMetadata and the page. */
const getGalleryPage = cache(async (path: string, timeline: string | null) => {
  const viewer = await getViewer();
  return timeline !== null
    ? loadTimelinePage(path, viewer, timeline)
    : loadGalleryPage(path, viewer);
});

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { locale, path } = await params;
  const normalized = normalizeGalleryPath(path);
  if (!normalized || normalized.timeline) return {};
  const timeline = timelineParam(await searchParams);
  return galleryMetadata(
    locale,
    await getGalleryPage(normalized.path, timeline),
  );
}

export default async function CatchAllPage({ params, searchParams }: Props) {
  const { locale, path } = await params;
  const normalized = normalizeGalleryPath(path);
  if (!normalized) notFound();
  if (normalized.timeline) redirect(normalized.path);

  const resolvedSearchParams = await searchParams;
  const timeline = timelineParam(resolvedSearchParams);
  const result = await getGalleryPage(normalized.path, timeline);
  if (result.kind === "redirect") redirect(result.to);
  if (result.kind === "not-found") notFound();

  return (
    <GalleryPage
      locale={locale}
      viewer={await getViewer()}
      result={result}
      searchParams={resolvedSearchParams}
    />
  );
}
