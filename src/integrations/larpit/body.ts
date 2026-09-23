/**
 * Synthesizes an album body from a Larpit.fi (https://larpit.fi) event page when the album's own
 * `body` is empty and its `eventMetadataUrl` points there. The database is never written; the
 * fetched data lives only in the in-process cache below.
 */

import { LRUCache } from "lru-cache";

import { publicUrl } from "@/config";
import type { AlbumPageVM } from "@/gallery/types";
import { getTranslations } from "@/translations";
import type { Translations } from "@/translations";

import { fetchLarp, larpitApiUrl, type Larp, type LarpLinkType } from "./api";

const successTtlMs = 3_600_000;
// An outage or a bogus id is retried after five minutes rather than on every page view.
const failureTtlMs = 300_000;

// lru-cache values must be objects, so a miss (`undefined`) stays distinguishable from a cached
// failed fetch (`{ larp: null }`).
const larps = new LRUCache<string, { larp: Larp | null }>({
  max: 500,
  ttl: successTtlMs,
});
const inFlight = new Map<string, Promise<Larp | null>>();

export async function cachedLarp(
  apiUrl: string,
  fetchLarpImpl: typeof fetchLarp = fetchLarp,
): Promise<Larp | null> {
  const hit = larps.get(apiUrl);
  if (hit) return hit.larp;
  const pending = inFlight.get(apiUrl);
  if (pending) return pending;

  const promise = fetchLarpImpl(apiUrl)
    .then((larp) => {
      larps.set(apiUrl, { larp }, { ttl: larp ? successTtlMs : failureTtlMs });
      return larp;
    })
    .finally(() => inFlight.delete(apiUrl));
  inFlight.set(apiUrl, promise);
  return promise;
}

// The full ASCII punctuation class CommonMark allows escaping, so any of it (*, _, #, [, <, ...)
// renders literally instead of as markdown syntax.
const asciiPunctuation = /[!-/:-@[-`{-~]/g;

function escapeMarkdownText(text: string): string {
  return text.replace(asciiPunctuation, (char) => `\\${char}`);
}

/** Blank-line-separated paragraphs, trimmed, with empties dropped. */
function splitFluff(fluffText: string | null): string[] {
  if (!fluffText) return [];
  return fluffText
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== "");
}

const linkTypeLabelKey: Record<LarpLinkType, keyof Translations["LarpitBody"]> =
  {
    HOMEPAGE: "homepage",
    PHOTOS: "photos",
    SOCIAL_MEDIA: "socialMedia",
    PLAYER_GUIDE: "playerGuide",
    SIGNUP: "signup",
    OTHER: "other",
  };

/** A PHOTOS link pointing back at this site or its sibling is redundant on its own album page. */
function isOwnPhotosLink(href: string): boolean {
  let hostname: string;
  try {
    hostname = new URL(href).hostname;
  } catch {
    return false;
  }
  const ownHosts = new Set(["larppikuvat.fi", "conikuvat.fi"]);
  try {
    ownHosts.add(new URL(publicUrl).hostname);
  } catch {
    // publicUrl is validated at startup (`src/config.ts`); nothing to add if it somehow isn't.
  }
  return ownHosts.has(hostname);
}

function larpLinkLines(
  larp: Larp,
  eventMetadataUrl: string,
  t: Translations["LarpitBody"],
): string[] {
  const lines = [`[${t.thisLarpInLarpit}](${eventMetadataUrl})`];
  for (const link of larp.links) {
    if (link.type === "PHOTOS" && isOwnPhotosLink(link.href)) continue;
    const label = link.title || t[linkTypeLabelKey[link.type]];
    lines.push(`[${label}](${link.href})`);
  }
  return lines;
}

/** Pure and unit-tested: the markdown body synthesized from a fetched `Larp`. */
export function larpBody(
  larp: Larp,
  eventMetadataUrl: string,
  t: Translations["LarpitBody"],
): string {
  const blocks = [`# ${escapeMarkdownText(larp.name)}`];
  for (const paragraph of splitFluff(larp.fluffText)) {
    blocks.push(`*${escapeMarkdownText(paragraph)}*`);
  }
  const description = larp.description?.trim();
  if (description) blocks.push(description);
  blocks.push(larpLinkLines(larp, eventMetadataUrl, t).join("  \n"));
  return blocks.join("\n\n");
}

/**
 * `vm` unchanged when it already has a body, its `eventMetadataUrl` is not a Larpit.fi larp page,
 * or fetching that page failed; otherwise `vm` with a body synthesized from it.
 */
export async function withEventMetadataBody(
  vm: AlbumPageVM,
  locale: string,
): Promise<AlbumPageVM> {
  if (vm.body.trim() !== "") return vm;
  const apiUrl = larpitApiUrl(vm.eventMetadataUrl);
  if (!apiUrl) return vm;
  const larp = await cachedLarp(apiUrl);
  if (!larp) return vm;
  const t = getTranslations(locale).LarpitBody;
  return { ...vm, body: larpBody(larp, vm.eventMetadataUrl, t) };
}
