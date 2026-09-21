import { NextResponse } from "next/server";

import { loadGalleryPage } from "@/gallery/load";
import { normalizeGalleryPath } from "@/gallery/paths";
import type { ClientSubalbum, MediaVariant } from "@/gallery/types";
import { buildMediaSet } from "@/gallery/v4/provider";
import { getViewer } from "@/gallery/viewer";
import { db } from "@/prisma/db";

/**
 * Minimal shim for the legacy Django `/api/v3/<path>` endpoint, kept for the one known external
 * consumer (desucon.fi's `FakeAlbum`, which reads only `subalbums[].{path,title,thumbnail.src}`).
 * Not an attempt to reproduce every field of the old API - extend it if another real consumer
 * turns up needing more. `preview` is included alongside `thumbnail` (legacy never exposed a
 * subalbum's preview) so a client can be updated to use it directly instead of the old hack of
 * regex-swapping ".thumbnail." for ".preview." in the thumbnail URL, which does not work against
 * v4-native photos: v4 encodes the role as a storage directory prefix, not a filename infix.
 *
 * A redirect is reported as legacy's own v3 API did: a 200 body with an empty `subalbums` and a
 * `redirect_url`, not an HTTP redirect - the target may be an external URL (an imported album's
 * own `redirect_url`), which an HTTP redirect can't represent by naively prefixing it with
 * `/api/v3`, and legacy callers already know to look at `redirect_url` themselves.
 */

interface MediaJson {
  src: string;
  width: number;
  height: number;
}

function mediaJson(variant: MediaVariant | undefined): MediaJson | null {
  return variant
    ? { src: variant.src, width: variant.width, height: variant.height }
    : null;
}

/** A v4 album's children's preview media, keyed by path; null for a legacy page or a childless one. */
async function previewsByPath(
  kind: string,
  albumId: string,
): Promise<Map<string, MediaJson | null>> {
  if (kind !== "album") return new Map();
  const children = await db.orm.public.Album.where({ parentId: albumId })
    .include("thumbnailPhoto", (t) => t.include("media"))
    .all();
  return new Map(
    children.map((c) => [
      c.path,
      c.thumbnailPhoto
        ? mediaJson(buildMediaSet(c.thumbnailPhoto.media, "preview")?.fallback)
        : null,
    ]),
  );
}

function subalbumJson(
  subalbum: ClientSubalbum,
  previews: Map<string, MediaJson | null>,
) {
  return {
    path: subalbum.path,
    title: subalbum.title,
    thumbnail: mediaJson(subalbum.thumbnail?.fallback),
    preview: previews.get(subalbum.path) ?? null,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;
  const normalized = normalizeGalleryPath(path);
  if (!normalized || normalized.timeline) return notFound();

  const result = await loadGalleryPage(normalized.path, await getViewer());
  if (result.kind === "not-found") return notFound();
  if (result.kind === "redirect") {
    // Legacy's own v3 API returned this as a 200 body, not an HTTP redirect - the target may be
    // an external URL (an imported album's own redirect_url), and the caller decides what to do
    // with it rather than the shim silently prefixing or following it.
    return NextResponse.json({
      path: normalized.path,
      title: "",
      subalbums: [],
      redirect_url: result.to,
    });
  }
  if (result.photo !== null) return notFound();

  const { album } = result;
  const previews = await previewsByPath(
    result.unfiltered.kind,
    result.unfiltered.id,
  );
  return NextResponse.json({
    path: album.path,
    title: album.title,
    subalbums: album.subalbums.map((s) => subalbumJson(s, previews)),
  });
}

function notFound() {
  return NextResponse.json(
    { status: 404, message: "album not found" },
    { status: 404 },
  );
}
