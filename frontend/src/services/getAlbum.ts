import Config from '../Config';
import AlbumCache from './AlbumCache';
import Album from '../models/Album';
import Picture from '../models/Picture';

// The result of these endpoints may change on every request.
const nonCachedPaths = ['/random'];

/**
 * The "low level" album getter.
 */
export async function getCached(path: string, bypassCache = false, download = false): Promise<Album> {
  const cached = AlbumCache.get(path);
  if (cached && !bypassCache) {
    return cached;
  }

  const params = download ? '?download=1' : '';

  const url = `${Config.backend.baseUrl}${Config.backend.apiPrefix}${path}${params}`;
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
    },
    credentials: 'same-origin',
  });

  // TODO: validate response
  const album: Album = await response.json();

  if (!nonCachedPaths.includes(album.path)) {
    AlbumCache.set(album.path, album);
  }

  // Cache the Album for Pictures and set .previous and .next
  let previous: Picture;
  album.pictures.forEach(picture => {
    if (previous) {
      previous.next = picture;
      picture.previous = previous;
    }

    AlbumCache.set(picture.path, album);
    previous = picture;
  });

  return album;
}

export interface Content {
  album: Album;
  picture?: Picture;
}

/**
 * Fetches an Album from the backend API. As any path may refer to an Album
 * or a Picture, we determine which we got after receiving results.
 *
 * @param path Path to an Album or Picture.
 */
export const getAlbum = async (path: string): Promise<Content> => {
  // Remove trailing slash
  if (path !== '/' && path.slice(-1) === '/') {
    path = path.slice(0, -1);
  }

  const album = await getCached(path);

  if (album.path === path) {
    return { album };
  } else {
    // path points to a picture in album
    const picture = album.pictures.find(pic => pic.path === path);

    if (!picture) {
      throw new Error("the album returned to us did not contain the requested path (this shouldn't happen)");
    }

    return { album, picture };
  }
};
