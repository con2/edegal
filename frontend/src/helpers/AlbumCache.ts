import Album from '../models/Album';

interface AlbumCache {
  get(path: string): Album | undefined;
  set(path: string, album: Album): void;
}

/**
 * Initializes the album cache. A partial ponyfill for Map is provided for IE.
 */
function makeAlbumCache(): AlbumCache {
  if (typeof Map !== 'undefined') {
    return new Map<string, Album>();
  }

  const cache: { [path: string]: Album } = {};
  return {
    get: (path: string) => cache[path] as Album | undefined,
    set: (path: string, album: Album) => (cache[path] = album),
  };
}

const AlbumCache: AlbumCache = makeAlbumCache();
export default AlbumCache;
