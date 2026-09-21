import "dotenv/config";
import { writeFile } from "node:fs/promises";

import { touchSeries, touchSubtree } from "@/gallery/v4/touch";
import {
  exportAlbums,
  exportMedia,
  exportPhotographers,
  exportPictures,
  exportSeries,
  exportTerms,
  type LegacyExportMedia,
  type LegacyExportPhotographer,
} from "@/legacy/export";
import { legacyHtmlToMarkdown } from "@/legacy/html";
import { pool } from "@/legacy/pool";
import { legacyVisibility } from "@/legacy/provider";
import { db } from "@/prisma/db";

/**
 * One-off migration of legacy (`edegal_*`) content into the v4 tables. Enriches, never replaces:
 * every entity is matched to an existing v4 row first (by path/slug/exact text), and a legacy
 * value only fills a field that is currently empty. See v4/docs/legacy-migration-plan.md.
 *
 * `--dry-run` (the default) touches no data: every "would-be-created" row gets a placeholder id
 * so downstream passes can still resolve relationships, and every write is skipped. `--apply`
 * performs the writes. `--only=<pass>` runs a single pass (terms, photographers, series, albums,
 * pictures). `--report=<path>` sets where the HTML->Markdown conversion report is written.
 */

const apply = process.argv.includes("--apply");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const onlyPass = onlyArg ? onlyArg.slice("--only=".length) : null;
const reportArg = process.argv.find((a) => a.startsWith("--report="));
const reportPath = reportArg
  ? reportArg.slice("--report=".length)
  : "legacy-migration-report.txt";

function shouldRun(pass: string): boolean {
  return onlyPass === null || onlyPass === pass;
}

const counts = new Map<string, number>();
function tally(key: string, n = 1): void {
  counts.set(key, (counts.get(key) ?? 0) + n);
}

interface ConversionReportEntry {
  source: string;
  html: string;
  markdown: string;
}
const conversionReport: ConversionReportEntry[] = [];

function convert(source: string, html: string): string {
  const markdown = legacyHtmlToMarkdown(html);
  conversionReport.push({ source, html, markdown });
  return markdown;
}

// ---- terms ----

const termsMap = new Map<number, string>();

function deriveTermsTitle(text: string): string {
  const firstLine =
    text
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l !== "") ?? "";
  return (firstLine || "Legacy terms").slice(0, 120);
}

async function migrateTerms(): Promise<void> {
  if (!shouldRun("terms")) return;
  for (const row of await exportTerms()) {
    if (row.text.trim() === "" && row.url.trim() === "") continue;
    // Match on the same text v4 would store (hard breaks added), not the raw legacy text - a
    // multi-line legacy row would otherwise never match its own already-migrated v4 row and get
    // recreated on every run.
    const text = row.text.replace(/\n/g, "  \n");
    const existing = await db.orm.public.Terms.where({ text, url: row.url })
      .select("id")
      .first();
    if (existing) {
      termsMap.set(row.id, existing.id);
      tally("terms.matched");
      continue;
    }
    tally("terms.created");
    const v4Id = !apply
      ? `dry:terms:${row.id}`
      : (
          await db.orm.public.Terms.create({
            title: deriveTermsTitle(row.text),
            text,
            url: row.url,
          })
        ).id;
    termsMap.set(row.id, v4Id);
  }
}

// ---- photographers ----

const photographerMap = new Map<number, string>();

const socialFields: {
  field: keyof LegacyExportPhotographer;
  title: string;
  href: (handle: string) => string;
}[] = [
  { field: "homepage_url", title: "Homepage", href: (h) => h },
  {
    field: "twitter_handle",
    title: "Twitter",
    href: (h) => `https://twitter.com/${h}`,
  },
  {
    field: "instagram_handle",
    title: "Instagram",
    href: (h) => `https://www.instagram.com/${h}`,
  },
  {
    field: "threads_handle",
    title: "Threads",
    href: (h) => `https://www.threads.net/@${h}`,
  },
  {
    field: "facebook_handle",
    title: "Facebook",
    href: (h) => `https://www.facebook.com/${h}`,
  },
  {
    field: "flickr_handle",
    title: "Flickr",
    href: (h) => `https://www.flickr.com/photos/${h}`,
  },
  {
    field: "bluesky_handle",
    title: "Bluesky",
    href: (h) => `https://bsky.app/profile/${h}`,
  },
];

/** A handle column sometimes holds a full URL, or a display name instead of a handle. */
function socialLinksFor(
  row: LegacyExportPhotographer,
): { title: string; href: string }[] {
  const links: { title: string; href: string }[] = [];
  for (const { field, title, href } of socialFields) {
    const raw = String(row[field] ?? "").trim();
    if (!raw) continue;
    if (raw.includes(" ")) {
      console.warn(
        `photographer ${row.slug}: skipping unparseable ${field} "${raw}"`,
      );
      continue;
    }
    links.push({ title, href: raw.includes("://") ? raw : href(raw) });
  }
  return links;
}

async function migratePhotographers(): Promise<void> {
  if (!shouldRun("photographers")) return;
  for (const row of await exportPhotographers()) {
    const existing = await db.orm.public.Photographer.where({
      slug: row.slug,
    })
      .select("id", "email", "introduction", "defaultTermsId")
      .first();

    let v4Id: string;
    if (existing) {
      v4Id = existing.id;
      const patch: Record<string, unknown> = {};
      if (!existing.email && row.email) patch.email = row.email;
      if (!existing.introduction && row.body)
        patch.introduction = convert(`photographer:${row.id}`, row.body);
      if (!existing.defaultTermsId && row.default_terms_and_conditions_id) {
        const termsId = termsMap.get(row.default_terms_and_conditions_id);
        if (termsId) patch.defaultTermsId = termsId;
      }
      if (Object.keys(patch).length > 0) {
        tally("photographers.enriched");
        if (apply)
          await db.orm.public.Photographer.where({ id: v4Id }).update(patch);
      } else {
        tally("photographers.matched");
      }
    } else {
      tally("photographers.created");
      const defaultTermsId = row.default_terms_and_conditions_id
        ? (termsMap.get(row.default_terms_and_conditions_id) ?? null)
        : null;
      const introduction = convert(`photographer:${row.id}`, row.body);
      v4Id = !apply
        ? `dry:photographer:${row.id}`
        : (
            await db.orm.public.Photographer.create({
              slug: row.slug,
              displayName: row.display_name,
              email: row.email,
              introduction,
              defaultTermsId,
            })
          ).id;
    }
    photographerMap.set(row.id, v4Id);

    const links = socialLinksFor(row);
    if (links.length === 0) continue;
    // Dry run never has a real id to query by; treat every link as new for the count.
    const existingLinks = apply
      ? await db.orm.public.PhotographerLink.where({ photographerId: v4Id })
          .select("href")
          .all()
      : [];
    // A trailing slash is the only difference seen in practice between a v4 profile's own link
    // and the same destination's legacy handle; ignore it so enriching doesn't add a duplicate.
    const withoutTrailingSlash = (href: string) => href.replace(/\/$/, "");
    const seen = new Set(
      existingLinks.map((l) => withoutTrailingSlash(l.href)),
    );
    const fresh = links.filter((l) => !seen.has(withoutTrailingSlash(l.href)));
    if (fresh.length === 0) continue;
    tally("photographerLinks.created", fresh.length);
    if (apply) {
      await db.orm.public.PhotographerLink.createAll(
        fresh.map((l, i) => ({
          photographerId: v4Id,
          href: l.href,
          title: l.title,
          ordering: existingLinks.length + i,
        })),
      );
    }
  }
}

// ---- series ----

const seriesMap = new Map<number, string>();

async function migrateSeries(): Promise<void> {
  if (!shouldRun("series")) return;
  for (const row of await exportSeries()) {
    const existing = await db.orm.public.Series.where({ slug: row.slug })
      .select("id", "description", "body")
      .first();
    let v4Id: string;
    if (existing) {
      v4Id = existing.id;
      const patch: Record<string, unknown> = {};
      if (!existing.description && row.description)
        patch.description = row.description;
      if (!existing.body.trim() && row.body.trim())
        patch.body = convert(`series:${row.id}`, row.body);
      if (Object.keys(patch).length > 0) {
        tally("series.enriched");
        if (apply) await db.orm.public.Series.where({ id: v4Id }).update(patch);
      } else {
        tally("series.matched");
      }
    } else {
      tally("series.created");
      const body = convert(`series:${row.id}`, row.body);
      v4Id = !apply
        ? `dry:series:${row.id}`
        : (
            await db.orm.public.Series.create({
              slug: row.slug,
              path: row.path,
              title: row.title,
              description: row.description,
              body,
              visibility: legacyVisibility(row.is_public, row.is_visible),
            })
          ).id;
    }
    seriesMap.set(row.id, v4Id);
  }
}

// ---- albums ----

const albumMap = new Map<number, string>();
interface AlbumInfo {
  path: string;
  slug: string;
  title: string;
  parentV4Id: string | null;
  date: string | null;
  coverPictureId: number | null;
}
const albumInfoByLegacyId = new Map<number, AlbumInfo>();
const hiddenSiblingMap = new Map<number, string>();

async function migrateAlbums(): Promise<void> {
  if (!shouldRun("albums")) return;
  // Parents before children (exportAlbums orders by level, lft), so parent_id always resolves.
  // Siblings share a level and are lft-ordered within it, so a global counter assigns them
  // increasing `ordering` values in their original legacy left-to-right order - load.ts's
  // subalbum sort falls back to ordering only when eventDate ties, which same-event siblings
  // dated to one day very often do.
  let nextOrdering = 0;
  for (const row of await exportAlbums()) {
    const ordering = nextOrdering++;
    const existing = await db.orm.public.Album.where({ path: row.path })
      .select("id", "description", "body", "redirectUrl", "termsId", "seriesId")
      .first();

    const parentV4Id =
      row.parent_id === null ? null : (albumMap.get(row.parent_id) ?? null);
    const termsId = row.terms_and_conditions_id
      ? (termsMap.get(row.terms_and_conditions_id) ?? null)
      : null;
    const seriesId = row.series_id
      ? (seriesMap.get(row.series_id) ?? null)
      : null;

    let v4Id: string;
    if (existing) {
      v4Id = existing.id;
      const patch: Record<string, unknown> = {};
      if (!existing.description && row.description)
        patch.description = row.description;
      if (!existing.body.trim() && row.body.trim())
        patch.body = convert(`album:${row.id}`, row.body);
      if (!existing.redirectUrl && row.redirect_url)
        patch.redirectUrl = row.redirect_url;
      if (!existing.termsId && termsId) patch.termsId = termsId;
      if (!existing.seriesId && seriesId) patch.seriesId = seriesId;
      if (Object.keys(patch).length > 0) {
        tally("albums.enriched");
        if (apply) await db.orm.public.Album.where({ id: v4Id }).update(patch);
      } else {
        tally("albums.matched");
      }
    } else {
      tally("albums.created");
      const body = convert(`album:${row.id}`, row.body);
      v4Id = !apply
        ? `dry:album:${row.id}`
        : (
            await db.orm.public.Album.create({
              parentId: parentV4Id,
              slug: row.slug,
              path: row.path,
              title: row.title,
              description: row.description,
              body,
              visibility: legacyVisibility(row.is_public, row.is_visible),
              layout: row.layout === "yearly" ? "yearly" : "simple",
              isDownloadable: row.is_downloadable,
              redirectUrl: row.redirect_url,
              eventDate: row.date,
              ordering,
              termsId,
              seriesId,
            })
          ).id;
    }
    albumMap.set(row.id, v4Id);
    albumInfoByLegacyId.set(row.id, {
      path: row.path,
      slug: row.slug,
      title: row.title,
      parentV4Id,
      date: row.date,
      coverPictureId: row.cover_picture_id,
    });

    const credits: {
      photographerId: string;
      isCopyright: boolean;
      description: string;
      ordering: number;
    }[] = [];
    // A photographer credited as their own album's director (15 albums in the conikuvat dump)
    // gets one merged row: v4_album_credit's key is (albumId, photographerId), so two rows for
    // the same pair is not just redundant but a constraint violation.
    const sameDirector =
      row.director_id !== null && row.director_id === row.photographer_id;
    if (row.photographer_id && photographerMap.has(row.photographer_id)) {
      credits.push({
        photographerId: photographerMap.get(row.photographer_id)!,
        isCopyright: true,
        description: sameDirector ? "director" : "",
        ordering: 0,
      });
    }
    if (
      row.director_id &&
      !sameDirector &&
      photographerMap.has(row.director_id)
    ) {
      credits.push({
        photographerId: photographerMap.get(row.director_id)!,
        isCopyright: false,
        description: "director",
        ordering: 1,
      });
    }
    if (credits.length === 0) continue;
    // Dry run never has a real id to query by; treat every credit as new for the count.
    const existingCredits = apply
      ? await db.orm.public.AlbumCredit.where({ albumId: v4Id })
          .select("photographerId")
          .all()
      : [];
    const seen = new Set(existingCredits.map((c) => c.photographerId));
    const fresh = credits.filter((c) => !seen.has(c.photographerId));
    if (fresh.length === 0) continue;
    tally("albumCredits.created", fresh.length);
    if (apply) {
      await db.orm.public.AlbumCredit.createAll(
        fresh.map((c) => ({ albumId: v4Id, ...c })),
      );
    }
  }
}

/**
 * A legacy album's non-public pictures move to a same-parent sibling album (`<slug>-hidden`,
 * `visibility: "hidden"`) instead of their original album, since v4 has no photo-level visibility.
 * Created lazily, once per legacy album, the first time one of its pictures needs it.
 */
async function hiddenSiblingAlbumId(
  legacyAlbumId: number,
): Promise<string | null> {
  const cached = hiddenSiblingMap.get(legacyAlbumId);
  if (cached) return cached;
  const info = albumInfoByLegacyId.get(legacyAlbumId);
  if (!info) return null;

  const path = `${info.path}-hidden`;
  const existing = await db.orm.public.Album.where({ path })
    .select("id")
    .first();
  let v4Id: string;
  if (existing) {
    v4Id = existing.id;
  } else {
    tally("hiddenSiblingAlbums.created");
    v4Id = !apply
      ? `dry:hidden:${legacyAlbumId}`
      : (
          await db.orm.public.Album.create({
            parentId: info.parentV4Id,
            slug: info.slug ? `${info.slug}-hidden` : "hidden",
            path,
            title: `${info.title} (hidden)`,
            visibility: "hidden",
            isDownloadable: false,
            eventDate: info.date,
          })
        ).id;
  }
  hiddenSiblingMap.set(legacyAlbumId, v4Id);
  return v4Id;
}

// ---- pictures and media ----

interface PhotoStub {
  id: string;
  ordering: number;
  takenAt: string | null;
  slug: string;
  hasThumbnail: boolean;
}

async function migratePicturesAndMedia(): Promise<{
  pictureMap: Map<number, string>;
  photosByAlbum: Map<string, PhotoStub[]>;
}> {
  const pictureMap = new Map<number, string>();
  const photosByAlbum = new Map<string, PhotoStub[]>();
  if (!shouldRun("pictures")) return { pictureMap, photosByAlbum };

  const [pictures, media] = await Promise.all([
    exportPictures(),
    exportMedia(),
  ]);
  // Legacy media specs could render more than one size at the same role+format (e.g. several
  // preview widths, all "preview"/"jpeg") for responsive <img>; v4's Media model has no size
  // dimension, one row per (photo, role, format), so only the largest variant of each survives.
  const bestByPicture = new Map<number, Map<string, LegacyExportMedia>>();
  for (const m of media) {
    const key = `${m.role}/${m.format}`;
    const byKey =
      bestByPicture.get(m.picture_id) ?? new Map<string, LegacyExportMedia>();
    const existing = byKey.get(key);
    if (existing) tally("media.duplicatesDropped");
    if (!existing || m.width * m.height > existing.width * existing.height) {
      byKey.set(key, m);
    }
    bestByPicture.set(m.picture_id, byKey);
  }
  const mediaByPicture = new Map<number, LegacyExportMedia[]>();
  for (const [pictureId, byKey] of bestByPicture) {
    mediaByPicture.set(pictureId, [...byKey.values()]);
  }

  for (const picture of pictures) {
    const albumV4Id = picture.is_public
      ? albumMap.get(picture.album_id)
      : await hiddenSiblingAlbumId(picture.album_id);
    if (!albumV4Id) {
      tally("pictures.skipped.noAlbum");
      continue;
    }
    const info = albumInfoByLegacyId.get(picture.album_id);
    const targetPath = picture.is_public
      ? picture.path
      : `${info?.path ?? ""}-hidden/${picture.slug}`;

    const pictureMedia = mediaByPicture.get(picture.id) ?? [];
    const hasOriginal = pictureMedia.some((m) => m.role === "original");
    const hasThumbnail = pictureMedia.some((m) => m.role === "thumbnail");
    if (!hasOriginal && !hasThumbnail) {
      tally("pictures.skipped.noMedia");
      console.warn(
        `picture ${picture.id} (${picture.path}): no original or thumbnail, skipping`,
      );
      continue;
    }

    const [existingPhoto, collidingAlbum] = await Promise.all([
      db.orm.public.Photo.where({ path: targetPath }).select("id").first(),
      db.orm.public.Album.where({ path: targetPath }).select("id").first(),
    ]);
    if (collidingAlbum) {
      tally("pictures.skipped.pathIsAlbum");
      console.warn(
        `picture ${picture.id}: target path ${targetPath} is a v4 album, skipping`,
      );
      continue;
    }
    if (existingPhoto) {
      pictureMap.set(picture.id, existingPhoto.id);
      tally("pictures.skipped.existingV4Photo");
      continue;
    }

    tally("pictures.created");
    let photoId: string;
    if (!apply) {
      photoId = `dry:photo:${picture.id}`;
    } else {
      photoId = (
        await db.orm.public.Photo.create({
          albumId: albumV4Id,
          slug: picture.slug,
          path: targetPath,
          title: picture.title,
          ordering: picture.ordering,
          takenAt: picture.taken_at,
          mediaKeyBase: picture.path,
        })
      ).id;
      if (pictureMedia.length > 0) {
        await db.orm.public.Media.createAll(
          pictureMedia.map((m) => ({
            photoId,
            role: m.role as "original" | "preview" | "thumbnail",
            format: m.format as "jpeg" | "webp" | "avif" | "png",
            width: m.width,
            height: m.height,
            storageKey: m.src,
          })),
        );
      }
      if (hasOriginal && !hasThumbnail) {
        await db.orm.public.MediaJob.create({ photoId });
        tally("mediaJobs.queued");
      }
    }
    pictureMap.set(picture.id, photoId);
    tally("media.migrated", pictureMedia.length);

    const list = photosByAlbum.get(albumV4Id) ?? [];
    list.push({
      id: photoId,
      ordering: picture.ordering,
      takenAt: picture.taken_at,
      slug: picture.slug,
      hasThumbnail,
    });
    photosByAlbum.set(albumV4Id, list);
  }

  return { pictureMap, photosByAlbum };
}

/** Same ordering as an album's own photo listing: ordering, then taken-at, then slug. */
function pickAutoThumbnail(photos: PhotoStub[]): string | null {
  const candidates = photos.filter((p) => p.hasThumbnail);
  candidates.sort(
    (a, b) =>
      a.ordering - b.ordering ||
      (a.takenAt ?? "").localeCompare(b.takenAt ?? "") ||
      a.slug.localeCompare(b.slug),
  );
  return candidates[0]?.id ?? null;
}

/**
 * Sets a thumbnail on every album the migration touched that does not already have one. The
 * legacy cover picture wins when it migrated into the album itself (frozen, not auto); a cover
 * that turned out non-public - and so lives in the hidden sibling instead - must not leak there,
 * so albums fall back to the first migrated photo with a thumbnail, picked automatically.
 */
async function fixupAlbumThumbnails(
  pictureMap: Map<number, string>,
  photosByAlbum: Map<string, PhotoStub[]>,
): Promise<void> {
  if (!shouldRun("pictures")) return;

  async function fixup(
    v4AlbumId: string,
    coverPictureId: number | null,
  ): Promise<void> {
    // Dry run never has a real id to query by; assume no v4 album already has one.
    const current = apply
      ? await db.orm.public.Album.where({ id: v4AlbumId })
          .select("thumbnailPhotoId")
          .first()
      : null;
    if (current?.thumbnailPhotoId) return;

    const ownPhotos = photosByAlbum.get(v4AlbumId) ?? [];
    const coverV4Id = coverPictureId ? pictureMap.get(coverPictureId) : null;
    const coverMigratedHere = coverV4Id
      ? ownPhotos.some((p) => p.id === coverV4Id && p.hasThumbnail)
      : false;

    const thumbnailPhotoId = coverMigratedHere
      ? coverV4Id!
      : pickAutoThumbnail(ownPhotos);
    if (!thumbnailPhotoId) return;
    tally("albums.thumbnailSet");
    if (apply) {
      await db.orm.public.Album.where({ id: v4AlbumId }).update({
        thumbnailPhotoId,
        thumbnailIsAuto: !coverMigratedHere,
      });
    }
  }

  for (const [legacyAlbumId, v4AlbumId] of albumMap) {
    await fixup(
      v4AlbumId,
      albumInfoByLegacyId.get(legacyAlbumId)?.coverPictureId ?? null,
    );
  }
  for (const v4AlbumId of hiddenSiblingMap.values()) {
    await fixup(v4AlbumId, null);
  }
}

async function writeConversionReport(): Promise<void> {
  const sections = conversionReport.map(
    ({ source, html, markdown }) =>
      `${"=".repeat(80)}\n${source}\n${"-".repeat(80)}\n-- HTML --\n${html}\n\n-- Markdown --\n${markdown}\n`,
  );
  await writeFile(reportPath, sections.join("\n"), "utf8");
  console.log(
    `\nWrote ${conversionReport.length} HTML->Markdown conversion(s) to ${reportPath}`,
  );
}

async function main(): Promise<void> {
  console.log(
    apply ? "APPLYING migration" : "DRY RUN (no writes will be made)",
  );
  await migrateTerms();
  await migratePhotographers();
  await migrateSeries();
  await migrateAlbums();
  const { pictureMap, photosByAlbum } = await migratePicturesAndMedia();
  await fixupAlbumThumbnails(pictureMap, photosByAlbum);

  if (apply) {
    await touchSubtree("/");
    for (const v4SeriesId of seriesMap.values()) {
      if (!v4SeriesId.startsWith("dry:")) await touchSeries(v4SeriesId);
    }
  }

  console.log("\n=== migration summary ===");
  for (const [key, n] of [...counts.entries()].sort())
    console.log(`${key}: ${n}`);

  await writeConversionReport();
}

try {
  await main();
} finally {
  await db.close();
  await pool.end();
}
