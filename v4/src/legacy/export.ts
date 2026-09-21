/**
 * Bulk reads used only by the one-off legacy-to-v4 data migration (`src/bin/migrate-legacy.ts`).
 * Read-only, like the rest of `src/legacy/`.
 */

import { pool } from "./pool";

export interface LegacyExportTerms {
  id: number;
  text: string;
  url: string;
}

export async function exportTerms(): Promise<LegacyExportTerms[]> {
  const { rows } = await pool.query<LegacyExportTerms>(
    `select id, text, url from edegal_termsandconditions order by id`,
  );
  return rows;
}

export interface LegacyExportPhotographer {
  id: number;
  slug: string;
  display_name: string;
  email: string;
  body: string;
  homepage_url: string;
  twitter_handle: string;
  instagram_handle: string;
  threads_handle: string;
  facebook_handle: string;
  flickr_handle: string;
  bluesky_handle: string;
  cover_picture_id: number | null;
  default_terms_and_conditions_id: number | null;
}

export async function exportPhotographers(): Promise<
  LegacyExportPhotographer[]
> {
  const { rows } = await pool.query<LegacyExportPhotographer>(
    `select id, slug, display_name, email, body, homepage_url, twitter_handle, instagram_handle,
       threads_handle, facebook_handle, flickr_handle, bluesky_handle, cover_picture_id,
       default_terms_and_conditions_id
     from edegal_photographer order by id`,
  );
  return rows;
}

export interface LegacyExportSeries {
  id: number;
  slug: string;
  path: string;
  title: string;
  description: string;
  body: string;
  is_public: boolean;
  is_visible: boolean;
}

export async function exportSeries(): Promise<LegacyExportSeries[]> {
  const { rows } = await pool.query<LegacyExportSeries>(
    `select id, slug, path, title, description, body, is_public, is_visible
     from edegal_series order by id`,
  );
  return rows;
}

export interface LegacyExportAlbum {
  id: number;
  path: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  is_public: boolean;
  is_visible: boolean;
  is_downloadable: boolean;
  redirect_url: string;
  layout: string;
  /** ISO date, or null when Django never determined one. */
  date: string | null;
  parent_id: number | null;
  series_id: number | null;
  photographer_id: number | null;
  director_id: number | null;
  terms_and_conditions_id: number | null;
  cover_picture_id: number | null;
  /** ISO 8601 with offset, or null for the handful of rows Django never timestamped. */
  created_at: string | null;
}

/**
 * Every album, parents before children (Django's nested-set `level`, tie-broken by `lft` so
 * siblings keep their tree order). The migration relies on this order to resolve each album's
 * `parent_id` to an already-created v4 album.
 */
export async function exportAlbums(): Promise<LegacyExportAlbum[]> {
  const { rows } = await pool.query<LegacyExportAlbum>(
    `select id, path, slug, title, description, body, is_public, is_visible, is_downloadable,
       redirect_url, layout, date::text as date, parent_id, series_id, photographer_id,
       director_id, terms_and_conditions_id, cover_picture_id, to_json(created_at) #>> '{}' as created_at
     from edegal_album order by level, lft`,
  );
  return rows;
}

export interface LegacyExportPicture {
  id: number;
  album_id: number;
  path: string;
  slug: string;
  title: string;
  is_public: boolean;
  /** ISO 8601 with offset, or null. */
  taken_at: string | null;
  ordering: number;
}

export async function exportPictures(): Promise<LegacyExportPicture[]> {
  const { rows } = await pool.query<LegacyExportPicture>(
    `select id, album_id, path, slug, title, is_public, to_json(taken_at) #>> '{}' as taken_at,
       "order" as ordering
     from edegal_picture order by id`,
  );
  return rows;
}

export interface LegacyExportMedia {
  id: number;
  picture_id: number;
  src: string;
  role: string;
  format: string;
  width: number;
  height: number;
}

export async function exportMedia(): Promise<LegacyExportMedia[]> {
  const { rows } = await pool.query<LegacyExportMedia>(
    `select id, picture_id, src, role, format, width, height from edegal_media order by id`,
  );
  return rows;
}
