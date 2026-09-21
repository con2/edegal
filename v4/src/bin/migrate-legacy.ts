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
 * pictures, redirects) - later passes depend on the in-memory maps earlier ones build, so `--only`
 * on its own is for isolating one pass's own logic, not for running a subset of a fresh migration.
 * `--report=<path>` sets where the HTML->Markdown conversion report is written.
 *
 * `--sync-photographer-visibility` is a one-time deal, not a normal part of every run: it
 * overwrites every migrated photographer's visibility to public-if-they-now-have-a-cover-photo,
 * hidden otherwise (never touching one already set to private - a stronger, deliberate choice).
 * Meant to be passed exactly once, right after this script starts recovering cover photos, to
 * establish everyone's starting visibility from legacy's own convention (no photo, no listing);
 * from then on photographers manage the setting themselves and ordinary runs never touch it.
 *
 * An earlier version of this script gave every migrated album a distinct `ordering`, which -
 * being a manual admin pin that always outranks eventDate in every subalbum sort - replaced the
 * site's whole chronological order with migration insertion order once LEGACY_ENABLED=false
 * stopped masking it (the old legacy-merge path re-sorted the front page by date regardless of
 * ordering). Fixed to leave `ordering` at its default; a database an earlier run already touched
 * needs a one-time `update v4_album set ordering = 0` by hand, not a script flag.
 */

const apply = process.argv.includes("--apply");
const syncVisibility = process.argv.includes("--sync-photographer-visibility");
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
const photographerCoverPictureId = new Map<number, number | null>();

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
    photographerCoverPictureId.set(row.id, row.cover_picture_id);

    const links = socialLinksFor(row);
    if (links.length === 0) continue;
    // A dry run's freshly-would-be-created photographer has no real id to query by, so those
    // report every link as new; an already-existing one (real id, even in dry run) is checked
    // for real, so a dry run against an already-migrated database reports accurately too.
    const existingLinks = v4Id.startsWith("dry:")
      ? []
      : await db.orm.public.PhotographerLink.where({ photographerId: v4Id })
          .select("href")
          .all();
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
  // A path collapseRedirectOnlyAlbums has already turned into a v4_redirect (this run or an
  // earlier one) must not get its album resurrected on the next run just because the legacy row
  // is still sitting there unchanged - the redirect is the deliberate, final outcome for it.
  const redirectedPaths = new Set(
    (await db.orm.public.Redirect.select("fromPath").all()).map(
      (r) => r.fromPath,
    ),
  );
  // Parents before children (exportAlbums orders by level, lft), so parent_id always resolves.
  for (const row of await exportAlbums()) {
    if (redirectedPaths.has(row.path)) {
      tally("albums.skippedRedirected");
      continue;
    }
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
              // Left at its default (0): ordering is a manual admin pin that always outranks
              // eventDate in every subalbum sort (loadV4Album, the photographer page, the old
              // front-page legacy merge) - giving every migrated album a distinct value here
              // replaced the site's whole chronological sort with migration insertion order.
              // Same-date siblings just sort by whatever order comes back from the query, same
              // as legacy's own tiebreak effectively was (see legacy-migration-plan.md).
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
    // A dry run's freshly-would-be-created album has no real id to query by, so those report
    // every credit as new; an already-existing one (real id, even in dry run) is checked for
    // real, so a dry run against an already-migrated database reports accurately too.
    const existingCredits = v4Id.startsWith("dry:")
      ? []
      : await db.orm.public.AlbumCredit.where({ albumId: v4Id })
          .select("photographerId")
          .all();
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
  hiddenPictureIds: Set<number>;
}> {
  const pictureMap = new Map<number, string>();
  const photosByAlbum = new Map<string, PhotoStub[]>();
  const hiddenPictureIds = new Set<number>();
  if (!shouldRun("pictures"))
    return { pictureMap, photosByAlbum, hiddenPictureIds };

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

    // Resolved below whether the picture is new or already migrated - either way it's a real v4
    // photo the thumbnail fixup pass needs to know about, so photosByAlbum/pictureMap are
    // populated in both branches, not just on create.
    let photoId: string;
    if (existingPhoto) {
      photoId = existingPhoto.id;
      tally("pictures.skipped.existingV4Photo");
    } else {
      tally("pictures.created");
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
      tally("media.migrated", pictureMedia.length);
    }
    pictureMap.set(picture.id, photoId);
    if (!picture.is_public) hiddenPictureIds.add(picture.id);

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

  return { pictureMap, photosByAlbum, hiddenPictureIds };
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
 * legacy cover picture wins whenever it migrated to a public path - it need not be one of the
 * album's own direct photos: Django auto-picks a descendant's picture as the cover for a
 * category album that only holds subalbums, and that cover is exactly as valid a thumbnail as a
 * direct one. A cover that turned out non-public - and so lives in a hidden sibling instead -
 * must not leak there, so those albums (and any with no usable cover at all) fall back to the
 * first migrated *direct* photo with a thumbnail, picked automatically.
 */
async function fixupAlbumThumbnails(
  pictureMap: Map<number, string>,
  photosByAlbum: Map<string, PhotoStub[]>,
  hiddenPictureIds: Set<number>,
): Promise<void> {
  if (!shouldRun("pictures")) return;

  async function fixup(
    v4AlbumId: string,
    coverPictureId: number | null,
  ): Promise<void> {
    // A dry run's freshly-would-be-created album has no real id to check, so those are assumed
    // thumbnail-less; an already-existing one (real id, even in dry run) is checked for real, so
    // a dry run against an already-migrated database doesn't relist albums that already have one.
    const current = v4AlbumId.startsWith("dry:")
      ? null
      : await db.orm.public.Album.where({ id: v4AlbumId })
          .select("thumbnailPhotoId")
          .first();
    if (current?.thumbnailPhotoId) return;

    const coverV4Id = coverPictureId ? pictureMap.get(coverPictureId) : null;
    const coverIsUsable =
      coverV4Id !== null &&
      coverV4Id !== undefined &&
      !hiddenPictureIds.has(coverPictureId!);

    const ownPhotos = photosByAlbum.get(v4AlbumId) ?? [];
    const thumbnailPhotoId = coverIsUsable
      ? coverV4Id
      : pickAutoThumbnail(ownPhotos);
    if (!thumbnailPhotoId) return;
    tally("albums.thumbnailSet");
    if (apply) {
      await db.orm.public.Album.where({ id: v4AlbumId }).update({
        thumbnailPhotoId,
        thumbnailIsAuto: !coverIsUsable,
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

/**
 * Recovers each migrated photographer's legacy profile photo, enrich-only (never overrides a
 * cover the photographer already set in v4). Runs after pictures, since the legacy picture must
 * already have a v4 photo to point `coverPhotoId` at. A cover that turned out non-public - and
 * so lives in a hidden sibling album instead - is not usable here either, same as an album cover.
 *
 * With `--sync-photographer-visibility`, also sets visibility from the *final* cover-photo
 * state (public with one, hidden without) - see the flag's own doc comment at the top of the
 * file for why this is a one-time thing, not part of an ordinary run.
 */
async function fixupPhotographerCoverPhotos(
  pictureMap: Map<number, string>,
  hiddenPictureIds: Set<number>,
): Promise<void> {
  if (!shouldRun("photographers")) return;
  for (const [legacyId, v4Id] of photographerMap) {
    if (v4Id.startsWith("dry:")) continue;
    const existing = await db.orm.public.Photographer.where({ id: v4Id })
      .select("coverPhotoId", "visibility")
      .first();
    if (!existing) continue;

    const legacyCoverId = photographerCoverPictureId.get(legacyId) ?? null;
    const coverV4Id = legacyCoverId ? pictureMap.get(legacyCoverId) : undefined;
    const coverIsUsable =
      coverV4Id !== undefined && !hiddenPictureIds.has(legacyCoverId!);

    const patch: Record<string, unknown> = {};
    if (!existing.coverPhotoId && coverIsUsable) {
      patch.coverPhotoId = coverV4Id;
      tally("photographers.coverPhotoRecovered");
    }
    if (syncVisibility && existing.visibility !== "private") {
      const hasCover =
        patch.coverPhotoId !== undefined || existing.coverPhotoId;
      const visibility = hasCover ? "public" : "hidden";
      if (existing.visibility !== visibility) {
        patch.visibility = visibility;
        tally(`photographers.visibilitySetTo.${visibility}`);
      }
    }
    if (Object.keys(patch).length > 0 && apply) {
      await db.orm.public.Photographer.where({ id: v4Id }).update(patch);
    }
  }
}

// ---- redirect-only albums ----

/**
 * An album kept solely to redirect (an embargo-era unguessable slug, kept around after the
 * embargo lifted so the old link still works) is better represented as a `v4_redirect` row than
 * as a whole album: it drops out of every listing instead of showing up as an empty tile, and
 * `resolveRedirect`'s exact-match lookup already does the same one-hop redirect the album's own
 * `redirectUrl` did. Runs last, over every album this migration touched (created or matched) -
 * checked against the album's *current* v4 state, not the legacy snapshot, so an admin who has
 * since added a real photo or subalbum to what used to be a redirect stub keeps it.
 *
 * Dry run has no real id for an album this same run would create, so those are skipped rather
 * than guessed at; the count this pass reports is therefore a floor, not a ceiling, until applied.
 *
 * A whole embargo-slug subtree (a redirect-only album whose only children are themselves
 * redirect-only stubs) collapses level by level: a parent visited before its children still
 * has them at that moment, only becoming eligible once they're gone. Sweeps until a full pass
 * collapses nothing more, rather than requiring a second invocation to finish the job.
 */
async function collapseRedirectOnlyAlbums(): Promise<void> {
  if (!shouldRun("redirects")) return;
  let collapsedThisSweep: number;
  do {
    collapsedThisSweep = 0;
    for (const v4AlbumId of albumMap.values()) {
      if (v4AlbumId.startsWith("dry:")) continue;
      const album = await db.orm.public.Album.where({ id: v4AlbumId })
        .select("path", "redirectUrl")
        .first();
      if (!album || !album.redirectUrl) continue;

      const [child, photo] = await Promise.all([
        db.orm.public.Album.where({ parentId: v4AlbumId }).select("id").first(),
        db.orm.public.Photo.where({ albumId: v4AlbumId }).select("id").first(),
      ]);
      if (child || photo) continue;

      tally("albums.collapsedToRedirect");
      collapsedThisSweep++;
      if (apply) {
        await db.transaction(async (tx) => {
          await tx.orm.public.Redirect.where({
            fromPath: album.path,
          }).deleteAndCount();
          await tx.orm.public.Redirect.create({
            fromPath: album.path,
            toPath: album.redirectUrl,
          });
          await tx.orm.public.Album.where({ id: v4AlbumId }).delete();
        });
      }
    }
    // Dry run can't observe its own (skipped) deletes, so a second sweep would just relist the
    // same candidates forever; one sweep is all a dry run can usefully report.
  } while (apply && collapsedThisSweep > 0);
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
  const { pictureMap, photosByAlbum, hiddenPictureIds } =
    await migratePicturesAndMedia();
  await fixupAlbumThumbnails(pictureMap, photosByAlbum, hiddenPictureIds);
  await fixupPhotographerCoverPhotos(pictureMap, hiddenPictureIds);
  await collapseRedirectOnlyAlbums();

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
