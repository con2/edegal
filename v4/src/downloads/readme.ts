import type { ClientAlbumPage } from "@/gallery/types";

import { creditLines } from "./credits";

/**
 * Text of the README.txt placed first in every album zip: where the photos came from, who to
 * credit and on what conditions. Mirrors the legacy README, with profile links in place of the
 * two hard-coded social media handles.
 */
export function albumReadme(
  album: ClientAlbumPage,
  absoluteUrl: string,
): string {
  const lines: string[] = [album.title, absoluteUrl, ""];

  for (const credit of creditLines(album.credits, null)) {
    const original = album.credits.find(
      (c) => c.displayName === credit.displayName,
    );
    const label = credit.isCopyright
      ? "Photographer"
      : credit.description || "Credit";
    lines.push(`${label}: ${credit.displayName}`);
    for (const link of original?.links ?? []) {
      lines.push(`${link.title}: ${link.href}`);
    }
    lines.push("");
  }

  if (album.description) lines.push(album.description, "");
  if (album.body.kind === "markdown" && album.body.text.trim())
    lines.push(album.body.text.trim(), "");

  if (album.terms) {
    lines.push(album.terms.text, "");
    if (album.terms.url) lines.push(album.terms.url, "");
  }

  return lines.join("\n").trim() + "\n";
}
