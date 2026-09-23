/** View-model the gallery pages render from. */

export type Visibility = "public" | "hidden" | "private";
export type MediaFormat = "jpeg" | "png" | "webp" | "avif";

export interface MediaVariant {
  src: string;
  /** Path relative to the media root; lets server code read the file through MediaStorage. */
  storageKey: string;
  width: number;
  height: number;
  format: MediaFormat;
  /** File size; null for media migrated from the old Django database, which never recorded one. */
  byteSize: number | null;
}

/** One rendered `<picture>`: the jpeg fallback plus alternate formats in preference order. */
export interface MediaSet {
  fallback: MediaVariant;
  alternates: MediaVariant[];
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
  /**
   * Server-only; stripped before the payload reaches the client. Owner of the photo's containing
   * album, when it differs from the page's own album (a timeline flattens photos from several
   * albums, so `applyVisibility` cannot assume the page's `ownerId` governs every photo in it).
   * `null` means that album has no owner, distinct from `undefined` ("use the page's own").
   */
  ownerId?: string | null;
  /**
   * The containing album's own credits/contact/download settings, present only when they differ
   * from the page album's (a timeline mixes photos from several albums with possibly different
   * photographers and download policy) - reaches the client, unlike `ownerId`.
   */
  credits?: CreditVM[];
  contactable?: boolean;
  isDownloadable?: boolean;
}

export interface SubalbumVM {
  path: string;
  title: string;
  /** ISO date (YYYY-MM-DD) or null. */
  date: string | null;
  visibility: Visibility;
  thumbnail: MediaSet | null;
  /** An album that is really just a redirect to an external site renders as a link tile. */
  externalUrl: string | null;
  /** Server-only; stripped before the payload reaches the client. */
  ownerId: string | null;
}

/** A photographer's profile picture: any photo, credited to whoever holds its copyright. */
export interface CoverVM {
  media: MediaSet;
  /** The photo's own page, when it is still browsable. */
  path: string | null;
  credits: { displayName: string; path: string | null }[];
}

export interface CreditVM {
  displayName: string;
  /** The photographer's page, when they have one. */
  path: string | null;
  isCopyright: boolean;
  description: string;
  links: { href: string; title: string }[];
}

export interface TermsVM {
  text: string;
  url: string;
}

export type PageKind =
  "album" | "series" | "photographers" | "photographer" | "timeline";

export interface AlbumPageVM {
  /** Albums and series come from the tables; the photographer pages are assembled from credits. */
  kind: PageKind;
  id: string;
  /** Server-only. */
  parentId: string | null;
  path: string;
  title: string;
  description: string;
  body: string;
  /** Source for a synthesized body when `body` is empty; see `integrations/larpit/body.ts`. */
  eventMetadataUrl: string;
  /** A photographer page's cover picture. */
  cover: CoverVM | null;
  date: string | null;
  layout: "simple" | "yearly";
  /** The album's own setting, which decides its listing inside the parent. */
  visibility: Visibility;
  /** The least visible of the album and its ancestors; decides access and every global listing. */
  effectiveVisibility: Visibility;
  /** True when a credited copyright holder has given a contact address for the contact form. */
  contactable: boolean;
  /** Server-only; stripped before the payload reaches the client. */
  ownerId: string | null;
  /** Server-only. */
  isOpenForSubalbums: boolean;
  isDownloadable: boolean;
  /** Photos uploaded but without a thumbnail yet; they are absent from `photos` until processed. */
  photosProcessing: number;
  /** True when any photo carries a manual ordering number, i.e. the album is not in capture-time order. */
  hasManualOrdering: boolean;
  /** Ancestors excluding this album, root first. */
  breadcrumb: Crumb[];
  subalbums: SubalbumVM[];
  photos: PhotoVM[];
  credits: CreditVM[];
  terms: TermsVM | null;
  previousInSeries: Crumb | null;
  nextInSeries: Crumb | null;
  /** An album that is really just a redirect; the page issues a redirect instead of rendering. */
  redirectUrl: string | null;
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
  | { kind: "album"; albumId: string; albumPath: string }
  | { kind: "photo"; albumId: string; photoPath: string }
  | { kind: "series"; seriesId: string; path: string };

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
