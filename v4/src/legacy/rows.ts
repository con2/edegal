/** Row shapes returned by the queries in ./sql.ts. Column names are the Django ones. */

export interface LegacyMediaRow {
  src: string;
  width: number;
  height: number;
  format: string;
  role: string;
}

export interface LegacyPhotographerRow {
  id: number;
  slug: string;
  display_name: string;
  homepage_url: string;
  twitter_handle: string;
  instagram_handle: string;
  threads_handle: string;
  facebook_handle: string;
  flickr_handle: string;
  bluesky_handle: string;
  has_email: boolean;
}

export interface LegacyAlbumRow {
  id: number;
  path: string;
  title: string;
  description: string;
  body: string;
  is_public: boolean;
  is_visible: boolean;
  is_downloadable: boolean;
  redirect_url: string;
  layout: string;
  /** ISO date or null. */
  date: string | null;
  parent_id: number | null;
  series_id: number | null;
  photographer: LegacyPhotographerRow | null;
  director: LegacyPhotographerRow | null;
  terms: { text: string; url: string } | null;
  series_path: string | null;
  series_title: string | null;
  previous_path: string | null;
  previous_title: string | null;
  next_path: string | null;
  next_title: string | null;
}

export interface LegacySubalbumRow {
  path: string;
  title: string;
  date: string | null;
  is_public: boolean;
  is_visible: boolean;
  /** False when some ancestor is not public / not visible. */
  ancestors_public: boolean;
  ancestors_visible: boolean;
  redirect_url: string;
  cover_media: LegacyMediaRow[] | null;
}

export interface LegacyPictureRow {
  id: number;
  path: string;
  title: string;
  is_public: boolean;
  /** ISO 8601 with offset, or null. */
  taken_at: string | null;
  media: LegacyMediaRow[] | null;
}

export interface LegacyAncestorRow {
  path: string;
  title: string;
  series_id: number | null;
  is_public: boolean;
  is_visible: boolean;
}

export interface LegacySeriesRow {
  id: number;
  path: string;
  title: string;
  description: string;
  body: string;
  is_public: boolean;
  is_visible: boolean;
}

export interface LegacyRedirectRow {
  path: string;
  redirect_url: string;
  is_public: boolean;
}

export interface LegacyPhotographerPageRow extends LegacyPhotographerRow {
  email: string;
  body: string;
  cover_media: LegacyMediaRow[] | null;
  cover_path: string | null;
  cover_credit_name: string | null;
  cover_credit_slug: string | null;
}

export interface LegacyPhotographerTileRow {
  id: number;
  slug: string;
  display_name: string;
  cover_media: LegacyMediaRow[] | null;
}

export interface LegacyPhotographerAlbumRow extends LegacySubalbumRow {
  id: number;
}
