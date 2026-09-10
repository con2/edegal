import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { importOriginal, takenAtOf } from "@/media/pipeline";
import { db } from "@/prisma/db";
import { pool } from "@/legacy/pool";

/**
 * Example v4 content for local development: a root album, a photographer and one event album tree
 * with photos generated from the legacy backend's example pictures. Re-running replaces the event
 * album; the root album is kept.
 */

const siteTitle = process.env.SITE_TITLE || "Larppikuvat.fi (v4 dev)";
const exampleDir = path.resolve(process.cwd(), "../backend/example_content");

function slugify(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function ensureRoot() {
  const existing = await db.orm.public.Album.where({ path: "/" }).first();
  if (existing) return existing;
  return db.orm.public.Album.create({
    slug: "",
    path: "/",
    title: siteTitle,
    body: "Welcome to the v4 development gallery.",
  });
}

async function ensurePhotographer() {
  const slug = "testi-kuvaaja";
  const existing = await db.orm.public.Photographer.where({ slug }).first();
  if (existing) return existing;
  const photographer = await db.orm.public.Photographer.create({
    slug,
    displayName: "Testi Kuvaaja",
    email: "testi@example.com",
    introduction: "Seed photographer for local development.",
  });
  await db.orm.public.PhotographerLink.createAll([
    {
      photographerId: photographer.id,
      href: "https://example.com",
      title: "Homepage",
      ordering: 0,
    },
    {
      photographerId: photographer.id,
      href: "https://www.instagram.com/example",
      title: "Instagram",
      ordering: 1,
    },
  ]);
  return photographer;
}

async function main() {
  const root = await ensureRoot();
  const photographer = await ensurePhotographer();
  // Whoever has signed in first owns the seeded albums, so owner-only views can be tried locally.
  const owner = await db.orm.public.User.orderBy((u) =>
    u.createdAt.asc(),
  ).first();

  const eventPath = "/v4-testitapahtuma-2026";
  const previous = await db.orm.public.Album.where({ path: eventPath }).first();
  if (previous) {
    // Children first: the parent relation is ON DELETE RESTRICT. Photos and media cascade.
    const children = await db.orm.public.Album.where({
      parentId: previous.id,
    }).all();
    for (const child of children) {
      await db.orm.public.Album.where({ id: child.id }).delete();
    }
    await db.orm.public.Album.where({ id: previous.id }).delete();
  }

  const event = await db.orm.public.Album.create({
    parentId: root.id,
    slug: eventPath.slice(1),
    path: eventPath,
    title: "V4 Testitapahtuma 2026",
    ownerId: owner?.id ?? null,
    body: "Photos from the **seed event**. Subalbums demonstrate public, hidden and private visibility.",
    eventDate: "2026-09-05",
    isOpenForSubalbums: true,
  });
  await db.orm.public.AlbumCredit.create({
    albumId: event.id,
    photographerId: photographer.id,
    isCopyright: true,
  });

  const subalbums = [
    { slug: "lauantai", title: "Lauantai", visibility: "public" as const },
    {
      slug: "piilotettu",
      title: "Piilotettu albumi",
      visibility: "hidden" as const,
    },
    {
      slug: "yksityinen",
      title: "Yksityinen albumi",
      visibility: "private" as const,
    },
  ];

  const files = (await readdir(exampleDir))
    .filter((f) => /\.jpe?g$/i.test(f))
    .sort();
  let landscapeThumbnail: string | null = null;

  for (const [index, sub] of subalbums.entries()) {
    const album = await db.orm.public.Album.create({
      parentId: event.id,
      slug: sub.slug,
      path: `${eventPath}/${sub.slug}`,
      title: sub.title,
      visibility: sub.visibility,
      ownerId: owner?.id ?? null,
      eventDate: "2026-09-05",
      ordering: index,
    });
    let firstLandscape: string | null = null;
    for (const [ordering, file] of files.entries()) {
      const slug = slugify(file);
      const photoPath = `${album.path}/${slug}`;
      const original = await readFile(path.join(exampleDir, file));
      const media = await importOriginal(photoPath, original);
      const photo = await db.orm.public.Photo.create({
        albumId: album.id,
        slug,
        path: photoPath,
        title: slug,
        ordering: (ordering + 1) * 10,
        takenAt: await takenAtOf(original),
      });
      await db.orm.public.Media.createAll(
        media.map((m) => ({ photoId: photo.id, ...m })),
      );
      const originalMedia = media.find((m) => m.role === "original")!;
      if (!firstLandscape && originalMedia.width >= originalMedia.height)
        firstLandscape = photo.id;
      console.log(`imported ${photoPath}`);
    }
    const thumbnailPhotoId =
      firstLandscape ??
      (await db.orm.public.Photo.where({ albumId: album.id }).first())?.id ??
      null;
    if (thumbnailPhotoId) {
      await db.orm.public.Album.where({ id: album.id }).update({
        thumbnailPhotoId,
      });
      if (sub.visibility === "public" && !landscapeThumbnail)
        landscapeThumbnail = thumbnailPhotoId;
    }
  }
  if (landscapeThumbnail) {
    await db.orm.public.Album.where({ id: event.id }).update({
      thumbnailPhotoId: landscapeThumbnail,
    });
  }
  console.log("seeded");
}

try {
  await main();
} finally {
  await db.close();
  await pool.end();
}
