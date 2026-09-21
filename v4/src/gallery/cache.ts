import { LRUCache } from "lru-cache";

import type { AlbumPageVM } from "./types";

// Validated against the album's updated_at on every hit; the TTL only bounds memory.
const ttlMs = 3_600_000;

interface Entry {
  vm: AlbumPageVM;
  /** The album's `updated_at` when loaded; null when the source has no version to compare. */
  version: string | null;
}

/**
 * Unfiltered album pages, one entry per album, so browsing the photos of an album in order costs
 * one database load. Visibility is applied per viewer after the cache. Entries are per process:
 * mutations from other processes (the media worker) are noticed through `version`.
 */
const albums = new LRUCache<string, Entry>({
  maxSize: 100 * 1024 * 1024,
  sizeCalculation: (entry) => JSON.stringify(entry.vm).length,
  ttl: ttlMs,
});

const inFlight = new Map<string, Promise<AlbumPageVM | null>>();

export function albumCacheKey(albumId: string): string {
  return albumId;
}

export async function cachedAlbum(
  albumId: string,
  load: () => Promise<AlbumPageVM | null>,
  version: string | null = null,
): Promise<AlbumPageVM | null> {
  const key = albumCacheKey(albumId);
  const hit = albums.get(key);
  if (hit && hit.version === version) return hit.vm;
  const pending = inFlight.get(key);
  if (pending) return pending;

  const promise = load()
    .then((vm) => {
      if (vm) albums.set(key, { vm, version }, { ttl: ttlMs });
      return vm;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

/** Drops an album and its parent (listings and thumbnails change with the child). */
export function invalidateAlbum(
  albumId: string,
  parentAlbumId?: string | null,
): void {
  albums.delete(albumCacheKey(albumId));
  if (parentAlbumId) albums.delete(albumCacheKey(parentAlbumId));
}
