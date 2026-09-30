import { db } from "@/prisma/db";
import { pool } from "@/prisma/pool";

import { takenAtOf } from "./pipeline";
import { type MediaBackend, type MediaStorage, storageFor } from "./storage";

export interface RefreshTakenAtOptions {
  /** Without this, every original is still read but nothing is written. */
  apply: boolean;
  /** Restrict to this album and everything below it; default every photo. */
  albumPath?: string;
  /** Stop after this many photos; default all. */
  limit?: number;
  /** Files in flight at once; default 8. */
  concurrency?: number;
  log?: (line: string) => void;
}

export interface RefreshTakenAtTally {
  photosScanned: number;
  changed: number;
  unchanged: number;
  missingFiles: number;
  unreadableFiles: number;
}

interface PhotoRow {
  id: string;
  album_id: string;
  path: string;
  taken_at: Date | null;
  storage_key: string;
  backend: MediaBackend;
}

/**
 * A JPEG's dimensions and EXIF sit in its first segments, so this many bytes is enough for
 * almost every camera file; sharp throws on a prefix that stops short, and the whole file is
 * read then.
 */
const headerBytes = 256 * 1024;
const batchSize = 500;

async function readPrefix(storage: MediaStorage, key: string, end?: number): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of await storage.getStream(key, end === undefined ? undefined : { end })) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function takenAtOfStored(storage: MediaStorage, key: string): Promise<string | null | undefined> {
  try {
    return await takenAtOf(await readPrefix(storage, key, headerBytes - 1));
  } catch {
    try {
      return await takenAtOf(await readPrefix(storage, key));
    } catch {
      return undefined;
    }
  }
}

async function photoRows(albumPath: string | undefined, afterId: string | null, limit: number): Promise<PhotoRow[]> {
  const { rows } = await pool.query<PhotoRow>(
    `select distinct on (p.id) p.id, p.album_id, p.path, p.taken_at, m.storage_key, m.backend
     from v4_photo p
     join v4_album a on a.id = p.album_id
     join v4_media m on m.photo_id = p.id and m.role = 'original'
     where ($1::text is null or a.path = $1 or a.path like $1 || '/%')
       and ($2::uuid is null or p.id > $2::uuid)
     order by p.id, m.id
     limit $3`,
    [albumPath ?? null, afterId, limit],
  );
  return rows;
}

async function forEachConcurrently<T>(items: readonly T[], concurrency: number, fn: (item: T) => Promise<void>) {
  let next = 0;
  const lanes = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) await fn(items[next++]!);
  });
  await Promise.all(lanes);
}

/**
 * Re-reads the capture time from every photo's original and stores it where it differs from the
 * row. Exists because uploads before 2026-10 stored the first timestamp found in the EXIF blob,
 * which is the export time for edited photos. Albums with a changed photo are bumped so their
 * cached pages re-sort.
 */
export async function refreshTakenAt(options: RefreshTakenAtOptions): Promise<RefreshTakenAtTally> {
  const { apply, albumPath, limit = Infinity, concurrency = 8, log = () => {} } = options;
  const tally: RefreshTakenAtTally = { photosScanned: 0, changed: 0, unchanged: 0, missingFiles: 0, unreadableFiles: 0 };
  const touchedAlbums = new Set<string>();

  const processRow = async (row: PhotoRow) => {
    tally.photosScanned++;
    const storage = storageFor(row.backend);
    if (!(await storage.stat(row.storage_key))) {
      tally.missingFiles++;
      log(`missing: ${row.storage_key}`);
      return;
    }
    const takenAt = await takenAtOfStored(storage, row.storage_key);
    if (takenAt === undefined) {
      tally.unreadableFiles++;
      log(`unreadable: ${row.storage_key}`);
      return;
    }
    const current = row.taken_at?.toISOString() ?? null;
    if (current === takenAt) {
      tally.unchanged++;
      return;
    }
    tally.changed++;
    log(`${row.path}: ${current} -> ${takenAt}`);
    touchedAlbums.add(row.album_id);
    if (apply) await db.orm.public.Photo.where({ id: row.id }).update({ takenAt });
  };

  let afterId: string | null = null;
  while (tally.photosScanned < limit) {
    const batch = await photoRows(albumPath, afterId, Math.min(batchSize, limit - tally.photosScanned));
    if (batch.length === 0) break;
    await forEachConcurrently(batch, concurrency, processRow);
    afterId = batch[batch.length - 1]!.id;
    log(`scanned ${tally.photosScanned} photos`);
  }

  if (apply && touchedAlbums.size > 0) {
    await pool.query(`update v4_album set updated_at = now() where id = any($1::uuid[])`, [[...touchedAlbums]]);
  }
  return tally;
}
