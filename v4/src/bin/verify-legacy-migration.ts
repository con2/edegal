import "dotenv/config";
import { writeFile } from "node:fs/promises";

import { loadGalleryPage } from "@/gallery/load";
import { loadPhotographerPageBySlug } from "@/gallery/photographers";
import { loadSeriesPageBySlug } from "@/gallery/series";
import type { AlbumPageVM } from "@/gallery/types";
import type { Viewer } from "@/gallery/viewer";
import {
  exportAlbums,
  exportPhotographers,
  exportSeries,
} from "@/legacy/export";
import { pool } from "@/legacy/pool";
import { db } from "@/prisma/db";

/**
 * Snapshots every page the legacy migration touches, as rendered today, to a JSON file. Run once
 * with `LEGACY_ENABLED=true` before the migration and once with `LEGACY_ENABLED=false` after, and
 * diff the two files - see v4/docs/legacy-migration-plan.md. Expected diffs are enumerable: body
 * text (HTML vs. Markdown), credit `links` after handle normalization, and the hidden-picture
 * sibling albums. Anything else is worth investigating before cutover.
 *
 * Scoped to albums, photographers and series - one page load each - rather than every individual
 * picture path: a picture's presence, title and thumbnail are already covered by its album's own
 * `photos` list below, and loading all ~45k picture pages individually would make this script
 * impractical to run.
 */

const outArg = process.argv.find((a) => a.startsWith("--out="));
const outPath = outArg
  ? outArg.slice("--out=".length)
  : "legacy-migration-verify.json";

const staffViewer: Viewer & { kind: "user" } = {
  kind: "user",
  userId: "",
  name: "verify-legacy-migration",
  isPhotographer: true,
  isAdmin: true,
};

interface ComparablePage {
  title: string;
  description: string;
  date: string | null;
  visibility: string;
  effectiveVisibility: string;
  breadcrumb: { path: string; title: string }[];
  subalbums: { path: string; title: string; thumbnail: string | null }[];
  photos: {
    path: string;
    title: string;
    takenAt: string | null;
    thumbnail: string;
  }[];
  credits: { displayName: string; isCopyright: boolean; links: string[] }[];
  termsUrl: string | null;
  redirectUrl: string | null;
  previousInSeries: string | null;
  nextInSeries: string | null;
}

function toComparable(page: AlbumPageVM): ComparablePage {
  return {
    title: page.title,
    description: page.description,
    date: page.date,
    visibility: page.visibility,
    effectiveVisibility: page.effectiveVisibility,
    breadcrumb: page.breadcrumb,
    subalbums: page.subalbums.map((s) => ({
      path: s.path,
      title: s.title,
      thumbnail: s.thumbnail?.fallback.src ?? null,
    })),
    photos: page.photos.map((p) => ({
      path: p.path,
      title: p.title,
      takenAt: p.takenAt,
      thumbnail: p.thumbnail.fallback.src,
    })),
    credits: page.credits.map((c) => ({
      displayName: c.displayName,
      isCopyright: c.isCopyright,
      links: c.links.map((l) => l.href),
    })),
    termsUrl: page.terms?.url ?? null,
    redirectUrl: page.redirectUrl,
    previousInSeries: page.previousInSeries?.path ?? null,
    nextInSeries: page.nextInSeries?.path ?? null,
  };
}

type Snapshot = ComparablePage | { notFound: true } | { redirectTo: string };

async function main(): Promise<void> {
  const results: Record<string, Snapshot> = {};

  for (const album of await exportAlbums()) {
    const result = await loadGalleryPage(album.path, staffViewer);
    results[album.path] =
      result.kind === "ok"
        ? toComparable(result.unfiltered)
        : result.kind === "redirect"
          ? { redirectTo: result.to }
          : { notFound: true };
  }

  for (const photographer of await exportPhotographers()) {
    const path = `/photographers/${photographer.slug}`;
    const page = await loadPhotographerPageBySlug(photographer.slug);
    results[path] = page ? toComparable(page) : { notFound: true };
  }

  for (const series of await exportSeries()) {
    const page = await loadSeriesPageBySlug(series.slug);
    results[series.path] = page ? toComparable(page) : { notFound: true };
  }

  await writeFile(outPath, JSON.stringify(results, null, 2), "utf8");
  console.log(
    `Wrote ${Object.keys(results).length} page snapshot(s) to ${outPath}`,
  );
}

try {
  await main();
} finally {
  await db.close();
  await pool.end();
}
