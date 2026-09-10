/**
 * The only module allowed to name legacy (edegal_*) tables. Read-only.
 *
 * Temporal columns are rendered to text in SQL (`::text` for dates, `to_json` for timestamps)
 * so no driver-level type parsers are needed; the parsers are shared with Prisma's runtime.
 */

import { pool } from "./pool";
import type {
  LegacyAlbumRow,
  LegacyAncestorRow,
  LegacyPhotographerAlbumRow,
  LegacyPhotographerPageRow,
  LegacyPhotographerTileRow,
  LegacyPictureRow,
  LegacyRedirectRow,
  LegacySeriesRow,
  LegacySubalbumRow,
} from "./rows";

const mediaJson = (alias: string) =>
  `json_build_object('src', ${alias}.src, 'width', ${alias}.width, 'height', ${alias}.height, 'format', ${alias}.format, 'role', ${alias}.role)`;

/**
 * UNION ALL half used by the path resolver. Parameter $1 is the path. Columns must match the
 * v4 half in src/gallery/resolve.ts.
 */
export const legacyProbeSql = `
  select 'legacy_series' as kind, id::text as id, null::text as album_id from edegal_series where path = $1
  union all
  select 'legacy_picture', id::text, album_id::text from edegal_picture where path = $1
  union all
  select 'legacy_album', id::text, id::text from edegal_album where path = $1
`;

const photographerJson = (alias: string) =>
  `case when ${alias}.id is null then null else json_build_object(
    'id', ${alias}.id, 'slug', ${alias}.slug, 'display_name', ${alias}.display_name, 'homepage_url', ${alias}.homepage_url,
    'twitter_handle', ${alias}.twitter_handle, 'instagram_handle', ${alias}.instagram_handle, 'threads_handle', ${alias}.threads_handle,
    'facebook_handle', ${alias}.facebook_handle, 'flickr_handle', ${alias}.flickr_handle, 'bluesky_handle', ${alias}.bluesky_handle) end`;

const albumSelect = `
  select a.id, a.path, a.title, a.description, a.body, a.is_public, a.is_visible, a.is_downloadable,
    a.redirect_url, a.layout, a.date::text as date, a.parent_id, a.series_id,
    ${photographerJson("p")} as photographer,
    ${photographerJson("d")} as director,
    case when t.id is null then null else json_build_object('text', t.text, 'url', t.url) end as terms,
    s.path as series_path, s.title as series_title,
    prev.path as previous_path, prev.title as previous_title,
    nxt.path as next_path, nxt.title as next_title
  from edegal_album a
  left join edegal_photographer p on p.id = a.photographer_id
  left join edegal_photographer d on d.id = a.director_id
  left join edegal_termsandconditions t on t.id = a.terms_and_conditions_id
  left join edegal_series s on s.id = a.series_id
  left join edegal_album prev on prev.id = a.previous_in_series_id
  left join edegal_album nxt on nxt.id = a.next_in_series_id
`;

export async function legacyAlbumById(
  id: number,
): Promise<LegacyAlbumRow | null> {
  const { rows } = await pool.query<LegacyAlbumRow>(
    `${albumSelect} where a.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function legacyAlbumByPath(
  path: string,
): Promise<LegacyAlbumRow | null> {
  const { rows } = await pool.query<LegacyAlbumRow>(
    `${albumSelect} where a.path = $1`,
    [path],
  );
  return rows[0] ?? null;
}

export async function legacyAncestors(
  paths: string[],
): Promise<LegacyAncestorRow[]> {
  if (paths.length === 0) return [];
  const { rows } = await pool.query<LegacyAncestorRow>(
    `select path, title, series_id from edegal_album where path = any($1::text[]) order by length(path)`,
    [paths],
  );
  return rows;
}

const subalbumSelect = `
  select a.path, a.title, a.date::text as date, a.is_public, a.is_visible, a.redirect_url,
    (select json_agg(${mediaJson("m")}) from edegal_media m where m.picture_id = a.cover_picture_id) as cover_media
  from edegal_album a
`;

/** Children ordered like Django: event date descending (unknown dates last), then tree order. */
export async function legacySubalbums(
  parentId: number,
): Promise<LegacySubalbumRow[]> {
  const { rows } = await pool.query<LegacySubalbumRow>(
    `${subalbumSelect} where a.parent_id = $1 order by a.date desc nulls last, a.tree_id`,
    [parentId],
  );
  return rows;
}

export async function legacySeriesAlbums(
  seriesId: number,
): Promise<LegacySubalbumRow[]> {
  const { rows } = await pool.query<LegacySubalbumRow>(
    `${subalbumSelect} where a.series_id = $1 order by a.date desc nulls last, a.tree_id`,
    [seriesId],
  );
  return rows;
}

export async function legacyPictures(
  albumId: number,
): Promise<LegacyPictureRow[]> {
  const { rows } = await pool.query<LegacyPictureRow>(
    `select p.id, p.path, p.title, p.is_public, to_json(p.taken_at) #>> '{}' as taken_at,
       (select json_agg(${mediaJson("m")}) from edegal_media m where m.picture_id = p.id) as media
     from edegal_picture p
     where p.album_id = $1
     order by p."order", p.taken_at, p.slug`,
    [albumId],
  );
  return rows;
}

export async function legacySeriesById(
  id: number,
): Promise<LegacySeriesRow | null> {
  const { rows } = await pool.query<LegacySeriesRow>(
    `select id, path, title, description, body, is_public, is_visible from edegal_series where id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function legacyAlbumsForRedirectWalk(
  paths: string[],
): Promise<LegacyRedirectRow[]> {
  if (paths.length === 0) return [];
  const { rows } = await pool.query<LegacyRedirectRow>(
    `select path, redirect_url, is_public from edegal_album where path = any($1::text[]) and redirect_url <> ''`,
    [paths],
  );
  return rows;
}

/** Same sampling trick as Django: a random id threshold, then the first public picture above it. */
export async function legacyRandomPublicPicturePath(): Promise<string | null> {
  const { rows } = await pool.query<{ path: string }>(
    `select p.path
     from edegal_picture p
     join edegal_album a on a.id = p.album_id
     where p.is_public and a.is_public and a.is_visible and a.redirect_url = ''
       and p.id >= (select floor(random() * coalesce(max(id), 0))::int from edegal_picture)
     order by p.id
     limit 1`,
  );
  return rows[0]?.path ?? null;
}

export async function legacyPublicPictureCount(): Promise<number> {
  const { rows } = await pool.query<{ n: string }>(
    `select count(*) as n from edegal_picture where is_public`,
  );
  return Number(rows[0]?.n ?? 0);
}

const photographerColumns =
  "p.id, p.slug, p.display_name, p.homepage_url, p.twitter_handle, p.instagram_handle, p.threads_handle, p.facebook_handle, p.flickr_handle, p.bluesky_handle";

export async function legacyPhotographerIdBySlug(
  slug: string,
): Promise<number | null> {
  const { rows } = await pool.query<{ id: number }>(
    `select id from edegal_photographer where slug = $1`,
    [slug],
  );
  return rows[0]?.id ?? null;
}

/** Photographers Django lists: those whose cover picture has media. */
export async function legacyPhotographerTiles(): Promise<
  LegacyPhotographerTileRow[]
> {
  const { rows } = await pool.query<LegacyPhotographerTileRow>(
    `select p.id, p.slug, p.display_name,
       (select json_agg(${mediaJson("m")}) from edegal_media m where m.picture_id = p.cover_picture_id) as cover_media
     from edegal_photographer p
     where p.cover_picture_id is not null
     order by p.display_name`,
  );
  return rows.filter((r) => r.cover_media && r.cover_media.length > 0);
}

export async function legacyPhotographerById(
  id: number,
): Promise<LegacyPhotographerPageRow | null> {
  const { rows } = await pool.query<LegacyPhotographerPageRow>(
    `select ${photographerColumns}, p.email, p.body,
       (select json_agg(${mediaJson("m")}) from edegal_media m where m.picture_id = p.cover_picture_id) as cover_media,
       cp.path as cover_path, cph.display_name as cover_credit_name, cph.slug as cover_credit_slug
     from edegal_photographer p
     left join edegal_picture cp on cp.id = p.cover_picture_id
     left join edegal_album ca on ca.id = cp.album_id
     left join edegal_photographer cph on cph.id = ca.photographer_id
     where p.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

/** Albums credited to a photographer, ordered like any listing. */
export async function legacyPhotographerAlbums(
  photographerId: number,
): Promise<LegacyPhotographerAlbumRow[]> {
  const { rows } = await pool.query<LegacyPhotographerAlbumRow>(
    `select a.id, a.path, a.title, a.date::text as date, a.is_public, a.is_visible, a.redirect_url,
       (select json_agg(${mediaJson("m")}) from edegal_media m where m.picture_id = a.cover_picture_id) as cover_media
     from edegal_album a
     where a.photographer_id = $1
     order by a.date desc nulls last, a.tree_id`,
    [photographerId],
  );
  return rows;
}
