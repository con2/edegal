/**
 * Reads what a Flickr album page says about itself through its Open Graph tags. Flickr has no
 * anonymous API for albums, and the tags carry everything an album link needs: title,
 * description, canonical address and cover picture.
 */

export interface FlickrAlbum {
  title: string;
  description: string;
  /** Canonical album address as Flickr states it. */
  url: string;
  imageUrl: string | null;
}

export type FlickrImportErrorCode = "flickrUnreachable" | "flickrNotAlbum";

export class FlickrImportError extends Error {
  constructor(readonly code: FlickrImportErrorCode) {
    super(code);
  }
}

const flickrHosts = new Set(["flickr.com", "www.flickr.com", "flic.kr"]);
const fetchTimeoutMs = 15_000;
const maxCoverBytes = 20 * 1024 * 1024;
const userAgent = "Edegal/4 (+https://github.com/con2/edegal)";

export function isFlickrUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      flickrHosts.has(url.hostname)
    );
  } catch {
    return false;
  }
}

function isFlickrImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname.endsWith(".staticflickr.com") ||
        flickrHosts.has(url.hostname))
    );
  } catch {
    return false;
  }
}

const namedEntities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
};

export function decodeEntities(text: string): string {
  return text.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,
    (match, entity: string) => {
      if (entity[0] === "#") {
        const code =
          entity[1] === "x" || entity[1] === "X"
            ? parseInt(entity.slice(2), 16)
            : parseInt(entity.slice(1), 10);
        return Number.isFinite(code) && code > 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : match;
      }
      return namedEntities[entity.toLowerCase()] ?? match;
    },
  );
}

/** `og:*` properties of every `<meta>` tag, first occurrence winning, attribute order free. */
export function parseOpenGraph(html: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = new Map<string, string>();
    for (const attribute of tag[0].matchAll(
      /([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g,
    )) {
      attributes.set(
        attribute[1].toLowerCase(),
        attribute[2] ?? attribute[3] ?? attribute[4] ?? "",
      );
    }
    const property = attributes.get("property") ?? attributes.get("name");
    const content = attributes.get("content");
    if (
      property?.startsWith("og:") &&
      content !== undefined &&
      !result.has(property)
    ) {
      result.set(property, decodeEntities(content).trim());
    }
  }
  return result;
}

const knownSuffixes = [/\s*\(larp\)$/i];

/** Larppikuvat photographers tag their Flickr albums "(LARP)"; the gallery does not need it. */
export function removeKnownSuffixes(title: string): string {
  let result = title.trim();
  for (const suffix of knownSuffixes)
    result = result.replace(suffix, "").trim();
  return result;
}

const isoDate = /(?<!\d)(\d{4})-(\d{2})-(\d{2})(?!\d)/;
const finnishDate = /(?<!\d)(\d{1,2})\.(\d{1,2})\.(\d{4})(?!\d)/;

function validDate(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day)
    return null;
  return date.toISOString().slice(0, 10);
}

/**
 * Lifts a date written in the title (`2026-03-14` or `14.3.2026`) out into the event date, so
 * "Korpkvädet 14.3.2026" becomes the album "Korpkvädet" dated 2026-03-14.
 */
export function splitDateFromTitle(title: string): {
  title: string;
  eventDate: string | null;
} {
  let match = title.match(isoDate);
  let eventDate = match ? validDate(+match[1], +match[2], +match[3]) : null;
  if (!eventDate) {
    match = title.match(finnishDate);
    eventDate = match ? validDate(+match[3], +match[2], +match[1]) : null;
  }
  if (!eventDate || !match) return { title: title.trim(), eventDate: null };
  const stripped = (
    title.slice(0, match.index) +
    " " +
    title.slice(match.index! + match[0].length)
  )
    .replace(/\s+/g, " ")
    .replace(/^[\s,–—-]+|[\s,–—-]+$/g, "")
    .trim();
  return { title: stripped || title.trim(), eventDate };
}

/** Flickr fills the description in for albums that have none; that text is not a description. */
const defaultDescription = /^Explore this photo album by/;

export function albumFromOpenGraph(
  og: Map<string, string>,
): FlickrAlbum | null {
  const title = og.get("og:title");
  const url = og.get("og:url");
  if (!title || !url || !isFlickrUrl(url)) return null;
  const description = og.get("og:description") ?? "";
  const imageUrl = og.get("og:image");
  return {
    title,
    description: defaultDescription.test(description) ? "" : description,
    url,
    imageUrl: imageUrl && isFlickrImageUrl(imageUrl) ? imageUrl : null,
  };
}

export async function fetchFlickrAlbum(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<FlickrAlbum> {
  let response: Response;
  try {
    response = await fetchImpl(url, {
      headers: { "user-agent": userAgent, accept: "text/html" },
      signal: AbortSignal.timeout(fetchTimeoutMs),
    });
  } catch {
    throw new FlickrImportError("flickrUnreachable");
  }
  if (!response.ok) throw new FlickrImportError("flickrUnreachable");
  // A short link may redirect anywhere; only a page that is still on Flickr is trusted.
  if (response.url && !isFlickrUrl(response.url))
    throw new FlickrImportError("flickrNotAlbum");
  const album = albumFromOpenGraph(parseOpenGraph(await response.text()));
  if (!album) throw new FlickrImportError("flickrNotAlbum");
  return album;
}

/** The cover picture bytes, or null when Flickr does not hand them over; the import goes on without. */
export async function fetchCoverImage(
  imageUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Buffer | null> {
  if (!isFlickrImageUrl(imageUrl)) return null;
  try {
    const response = await fetchImpl(imageUrl, {
      headers: { "user-agent": userAgent },
      signal: AbortSignal.timeout(fetchTimeoutMs),
    });
    if (!response.ok) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    return bytes.byteLength > maxCoverBytes ? null : bytes;
  } catch {
    return null;
  }
}

/** `https://live.staticflickr.com/65535/12345_abc_b.jpg` → `12345_abc_b.jpg`. */
export function coverFilename(imageUrl: string): string {
  try {
    return new URL(imageUrl).pathname.split("/").pop() || "cover.jpg";
  } catch {
    return "cover.jpg";
  }
}
