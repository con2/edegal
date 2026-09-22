import type { ClientAlbumPage, CreditVM, PhotoVM, Visibility } from "./types";

export interface CreditRow {
  isCopyright: boolean;
  description: string;
  photographer: {
    displayName: string;
    slug: string;
    email: string;
    visibility: Visibility;
    links: { href: string; title: string; ordering: number }[];
  };
}

export function creditVM(credit: CreditRow): CreditVM {
  return {
    displayName: credit.photographer.displayName,
    // A private profile's own page 404s for everyone but its owner and admins, so a link to it
    // from someone else's page would just be broken for every other visitor.
    path:
      credit.photographer.visibility === "private"
        ? null
        : `/photographers/${credit.photographer.slug}`,
    isCopyright: credit.isCopyright,
    description: credit.description,
    links: credit.photographer.links
      .slice()
      .sort((a, b) => a.ordering - b.ordering)
      .map(({ href, title }) => ({ href, title })),
  };
}

/** A copyright holder with a contact address makes the album (or photo) contactable. */
export function isContactable(credits: CreditRow[]): boolean {
  return credits.some((c) => c.isCopyright && c.photographer.email !== "");
}

// The above builds a CreditVM from a raw database row; the rest of this file derives a
// copyright display string from already-built CreditVMs, for the client-facing page.

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

/** "© 2024 Jane, John", "© Jane, John" with no known date, or "" when nobody holds copyright. */
export function copyrightStatement(
  photo: PhotoVM | null,
  album: Pick<ClientAlbumPage, "credits" | "date">,
): string {
  const { year, holders } = copyrightOf(photo, album);
  if (holders.length === 0) return "";
  const names = holders.map((h) => h.displayName).join(", ");
  return year ? `© ${year} ${names}` : `© ${names}`;
}
