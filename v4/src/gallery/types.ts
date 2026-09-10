/**
 * View-model shared by the v4 and legacy providers. The page renders from this shape only, so the
 * two content sources are indistinguishable to visitors.
 */

export type Visibility = "public" | "hidden" | "private";
export type MediaFormat = "jpeg" | "webp" | "avif" | "heif";
export type ContentSource = "v4" | "legacy";

export interface MediaVariant {
  src: string;
  /** Path relative to the media root; lets server code read the file through MediaStorage. */
  storageKey: string;
  width: number;
  height: number;
  format: MediaFormat;
}

/** One rendered `<picture>`: the jpeg fallback plus alternate formats in preference order. */
export interface MediaSet {
  fallback: MediaVariant;
  alternates: Pick<MediaVariant, "src" | "format">[];
}

export interface Crumb {
  path: string;
  title: string;
}

export interface PhotoVM {
  id: string;
  path: string;
  title: string;
  visibility: Visibility;
  /** ISO 8601 with offset, or null when EXIF had no timestamp. */
  takenAt: string | null;
  thumbnail: MediaSet;
  preview: MediaSet | null;
  original: MediaVariant | null;
}

export interface SubalbumVM {
  path: string;
  title: string;
  /** ISO date (YYYY-MM-DD) or null. */
  date: string | null;
  visibility: Visibility;
  thumbnail: MediaSet | null;
  /** Legacy albums may be pure redirects to an external site; rendered as an external link tile. */
  externalUrl: string | null;
  /** Server-only; stripped before the payload reaches the client. */
  ownerId: string | null;
}

export interface CreditVM {
  displayName: string;
  isCopyright: boolean;
  description: string;
  links: { href: string; title: string }[];
}

export interface TermsVM {
  /** Legacy terms are plain text with line breaks; v4 terms are Markdown. */
  kind: "markdown" | "text";
  text: string;
  url: string;
}

export interface AlbumPageVM {
  source: ContentSource;
  id: string;
  /** Server-only. */
  parentId: string | null;
  path: string;
  title: string;
  description: string;
  body: { kind: "markdown" | "html"; text: string };
  date: string | null;
  layout: "simple" | "yearly";
  visibility: Visibility;
  /** Server-only; stripped before the payload reaches the client. */
  ownerId: string | null;
  /** Server-only. */
  isOpenForSubalbums: boolean;
  isDownloadable: boolean;
  /** Photos uploaded but without a thumbnail yet; they are absent from `photos` until processed. */
  photosProcessing: number;
  /** Ancestors excluding this album, root first. */
  breadcrumb: Crumb[];
  subalbums: SubalbumVM[];
  photos: PhotoVM[];
  credits: CreditVM[];
  terms: TermsVM | null;
  previousInSeries: Crumb | null;
  nextInSeries: Crumb | null;
  /** Legacy album-level redirect; the page issues a redirect instead of rendering. */
  redirectUrl: string | null;
  /** Where legacy albums are edited; null for v4 albums. */
  legacyAdminUrl: string | null;
}

export type ClientSubalbum = Omit<SubalbumVM, "ownerId">;

/** What crosses the server/client boundary: the view-model minus server-only fields. */
export type ClientAlbumPage = Omit<
  AlbumPageVM,
  "ownerId" | "parentId" | "isOpenForSubalbums" | "subalbums"
> & {
  subalbums: ClientSubalbum[];
};

export type Resolution =
  | { kind: "album"; source: ContentSource; albumId: string; albumPath: string }
  | { kind: "photo"; source: ContentSource; albumId: string; photoPath: string }
  | { kind: "series"; seriesId: number; path: string };

export type GalleryPageResult =
  | {
      kind: "ok";
      album: ClientAlbumPage;
      /** Server-only view of the same album, for authorization decisions. */
      unfiltered: AlbumPageVM;
      requestedPath: string;
      photo: PhotoVM | null;
    }
  | { kind: "redirect"; to: string }
  | { kind: "not-found" };
