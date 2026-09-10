import { breadcrumbSeparator } from "@/components/breadcrumb";

const separators = ["-", "–", "—", ":", ",", "|", "/", "·", "»", "&"];

/**
 * Port of the legacy `strip_photographer_name_from_title`: removes the photographer's name from an
 * album title together with any punctuation that separated it. "Foo Bar - Cool Pics" → "Cool Pics".
 */
export function stripPhotographerName(title: string, name: string): string {
  if (!name) return title.trim();
  let result = title.split(name).join("").trim();
  let previous: string | null = null;
  while (result !== previous) {
    previous = result;
    for (const punctuation of separators) {
      while (result.startsWith(punctuation))
        result = result.slice(punctuation.length).trim();
      while (result.endsWith(punctuation))
        result = result.slice(0, -punctuation.length).trim();
    }
  }
  return result;
}

/**
 * How an album is titled on its photographer's page: its ancestors' titles (root excluded) and
 * its own, joined with the breadcrumb separator, with the photographer's own name stripped from
 * each part because it would repeat on every tile.
 */
export function titleInPhotographerContext(
  ancestorTitles: string[],
  title: string,
  photographerName: string,
): string {
  const parts = [...ancestorTitles, title]
    .map((t) => stripPhotographerName(t, photographerName))
    .filter(Boolean);
  return parts.length > 0 ? parts.join(breadcrumbSeparator) : title;
}
