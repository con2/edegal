import type { ClientAlbumPage, CreditVM, PhotoVM } from "./types";

export interface Copyright {
  /** Four-digit year, or "" when neither the photo nor the album has a date. */
  year: string;
  holders: CreditVM[];
}

/**
 * The copyright year and holders to show for a photo, or - with no photo selected - for an album
 * or timeline page as a whole, attributed to its own first photo (the one already used to pick
 * that page's preview image). A photo's own credits and date, when present, override the page
 * album's: a timeline photo's do, since it may come from a different album than the page itself.
 */
export function copyrightOf(
  photo: PhotoVM | null,
  album: Pick<ClientAlbumPage, "credits" | "date">,
): Copyright {
  const credits = photo?.credits ?? album.credits;
  return {
    year: (photo?.takenAt ?? album.date ?? "").slice(0, 4),
    holders: credits.filter((c) => c.isCopyright),
  };
}

/** "© 2024 Jane, John", or "" when nobody holds copyright. */
export function copyrightStatement(
  photo: PhotoVM | null,
  album: Pick<ClientAlbumPage, "credits" | "date">,
): string {
  const { year, holders } = copyrightOf(photo, album);
  if (holders.length === 0) return "";
  return `© ${year} ${holders.map((h) => h.displayName).join(", ")}`;
}
