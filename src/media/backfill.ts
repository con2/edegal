import sharp from "sharp";

import { db } from "@/prisma/db";
import { pool } from "@/prisma/pool";

import { maxInputPixels } from "./pipeline";
import { mediaStorage } from "./storage";

export interface BackfillOptions {
  /** Without this, every file is still read but nothing is written. */
  apply: boolean;
  /** Stop after this many rows; default all. */
  limit?: number;
  /** Files in flight at once; default 8. */
  concurrency?: number;
  log?: (line: string) => void;
}

export interface BackfillTally {
  rowsScanned: number;
  sizesSet: number;
  originalsInspected: number;
  /** Originals per EXIF orientation value other than 1. */
  rotatedOriginals: Record<number, number>;
  dimensionsChanged: number;
  jobsQueued: number;
  missingFiles: number;
  unreadableFiles: number;
}

interface PendingRow {
  id: string;
  photo_id: string;
  album_id: string;
  role: "original" | "preview" | "thumbnail";
  storage_key: string;
  width: number;
  height: number;
}

interface OriginalInfo {
  width: number;
  height: number;
  orientation: number;
}

/**
 * A JPEG's dimensions and EXIF sit in its first segments, so this many bytes is enough for
 * almost every camera file; sharp throws on a prefix that stops short, and the caller then
 * reads the whole file.
 */
const headerBytes = 256 * 1024;
const batchSize = 500;

async function readPrefix(key: string, end?: number): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of mediaStorage.getStream(key, end === undefined ? undefined : { end })) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function metadataOf(data: Buffer): Promise<OriginalInfo | null> {
  const { width, height, orientation, autoOrient } = await sharp(data, {
    failOn: "none",
    limitInputPixels: maxInputPixels,
  }).metadata();
  if (!width || !height) return null;
  return { width: autoOrient.width, height: autoOrient.height, orientation: orientation ?? 1 };
}

/** Displayed dimensions and orientation tag of a stored original, or null if it cannot be decoded. */
export async function inspectStoredOriginal(key: string): Promise<OriginalInfo | null> {
  try {
    return await metadataOf(await readPrefix(key, headerBytes - 1));
  } catch {
    try {
      return await metadataOf(await readPrefix(key));
    } catch {
      return null;
    }
  }
}

async function pendingRows(afterId: string | null, limit: number): Promise<PendingRow[]> {
  const { rows } = await pool.query<PendingRow>(
    `select m.id, m.photo_id, p.album_id, m.role, m.storage_key, m.width, m.height
     from v4_media m join v4_photo p on p.id = m.photo_id
     where m.byte_size is null and ($1::uuid is null or m.id > $1::uuid)
     order by m.id
     limit $2`,
    [afterId, limit],
  );
  return rows;
}

async function queueJobUnlessPending(photoId: string): Promise<boolean> {
  const open = await db.orm.public.MediaJob.where({ photoId }).all();
  if (open.some((j) => j.status === "pending" || j.status === "running")) return false;
  await db.orm.public.MediaJob.create({ photoId });
  return true;
}

async function forEachConcurrently<T>(items: readonly T[], concurrency: number, fn: (item: T) => Promise<void>) {
  let next = 0;
  const lanes = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) await fn(items[next++]!);
  });
  await Promise.all(lanes);
}

/**
 * Inspects every media row that still lacks `byteSize`, which is exactly the set of rows the
 * legacy migration created without ever opening the file. Each gets its size from the store; an
 * original also gets its dimensions as displayed (the legacy site recorded stored pixels, so a
 * camera portrait shot was recorded landscape) and, when its EXIF orientation tag is not 1, a
 * media job so the worker replaces the legacy previews, which were generated without applying
 * the tag. Rows whose file is missing or undecodable keep a null size and are reported, so a
 * later run picks them up again.
 */
export async function backfillMedia(options: BackfillOptions): Promise<BackfillTally> {
  const { apply, limit = Infinity, concurrency = 8, log = () => {} } = options;
  const tally: BackfillTally = {
    rowsScanned: 0,
    sizesSet: 0,
    originalsInspected: 0,
    rotatedOriginals: {},
    dimensionsChanged: 0,
    jobsQueued: 0,
    missingFiles: 0,
    unreadableFiles: 0,
  };
  const touchedAlbums = new Set<string>();
  const queuedPhotos = new Set<string>();

  const processRow = async (row: PendingRow) => {
    tally.rowsScanned++;
    const stat = await mediaStorage.stat(row.storage_key);
    if (!stat) {
      tally.missingFiles++;
      log(`missing: ${row.storage_key}`);
      return;
    }
    if (row.role !== "original") {
      if (apply) await db.orm.public.Media.where({ id: row.id }).update({ byteSize: stat.size });
      tally.sizesSet++;
      return;
    }

    const info = await inspectStoredOriginal(row.storage_key);
    if (!info) {
      tally.unreadableFiles++;
      log(`unreadable: ${row.storage_key}`);
      return;
    }
    tally.originalsInspected++;
    const changed = info.width !== row.width || info.height !== row.height;
    if (changed) {
      tally.dimensionsChanged++;
      log(`dimensions ${row.width}x${row.height} -> ${info.width}x${info.height}: ${row.storage_key}`);
    }
    if (apply) {
      await db.orm.public.Media.where({ id: row.id }).update({
        width: info.width,
        height: info.height,
        byteSize: stat.size,
      });
    }
    tally.sizesSet++;

    if (info.orientation !== 1) {
      tally.rotatedOriginals[info.orientation] = (tally.rotatedOriginals[info.orientation] ?? 0) + 1;
      if (!queuedPhotos.has(row.photo_id)) {
        queuedPhotos.add(row.photo_id);
        if (!apply || (await queueJobUnlessPending(row.photo_id))) tally.jobsQueued++;
        touchedAlbums.add(row.album_id);
      }
    }
  };

  let afterId: string | null = null;
  while (tally.rowsScanned < limit) {
    const batch = await pendingRows(afterId, Math.min(batchSize, limit - tally.rowsScanned));
    if (batch.length === 0) break;
    await forEachConcurrently(batch, concurrency, processRow);
    afterId = batch[batch.length - 1]!.id;
    log(`scanned ${tally.rowsScanned} rows`);
  }

  if (apply && touchedAlbums.size > 0) {
    await pool.query(`update v4_album set updated_at = now() where id = any($1::uuid[])`, [[...touchedAlbums]]);
  }
  return tally;
}
