import { LRUCache } from "lru-cache";

import type { AlbumPageVM, ContentSource } from "./types";

const ttlMs: Record<ContentSource, number> = {
  // Legacy content is edited in the Django admin, which cannot invalidate this cache.
  legacy: 60_000,
  v4: 300_000,
};

/**
 * Unfiltered album pages, one entry per album, so browsing the photos of an album in order costs
 * one database load. Visibility is applied per viewer after the cache. Per process; the TTL bounds
 * staleness when there is more than one replica.
 */
const albums = new LRUCache<string, AlbumPageVM>({
  maxSize: 100 * 1024 * 1024,
  sizeCalculation: (vm) => JSON.stringify(vm).length,
  ttl: ttlMs.v4,
});

const inFlight = new Map<string, Promise<AlbumPageVM | null>>();

export function albumCacheKey(source: ContentSource, albumId: string): string {
  return `${source}:${albumId}`;
}

export async function cachedAlbum(
  source: ContentSource,
  albumId: string,
  load: () => Promise<AlbumPageVM | null>,
): Promise<AlbumPageVM | null> {
  const key = albumCacheKey(source, albumId);
  const hit = albums.get(key);
  if (hit) return hit;
  const pending = inFlight.get(key);
  if (pending) return pending;

  const promise = load()
    .then((vm) => {
      if (vm) albums.set(key, vm, { ttl: ttlMs[source] });
      return vm;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

/** Drops an album and its parent (listings and thumbnails change with the child). */
export function invalidateAlbum(
  source: ContentSource,
  albumId: string,
  parentAlbumId?: string | null,
): void {
  albums.delete(albumCacheKey(source, albumId));
  if (parentAlbumId) albums.delete(albumCacheKey(source, parentAlbumId));
}
