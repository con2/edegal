/**
 * Synthesizes an album body from a Larpit.fi (https://larpit.fi) event page when the album's own
 * `body` is empty and its `eventMetadataUrl` points there. The database is never written; the
 * fetched data lives only in the in-process cache below.
 */

import { LRUCache } from "lru-cache";
import { z } from "zod";

import { publicUrl } from "@/config";
import { getTranslations } from "@/translations";
import type { Translations } from "@/translations";

import type { AlbumPageVM } from "./types";

const larpPathRegex =
  /^\/larp\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/?$/i;

/** `https://larpit.fi/larp/<uuid>` (optionally `www.`, a trailing slash, a query) to its API URL. */
export function larpitApiUrl(eventMetadataUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(eventMetadataUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.hostname !== "larpit.fi" && url.hostname !== "www.larpit.fi")
    return null;
  const match = url.pathname.match(larpPathRegex);
  return match ? `https://larpit.fi/api/larp/${match[1]}` : null;
}

const linkTypes = [
  "HOMEPAGE",
  "PHOTOS",
  "SOCIAL_MEDIA",
  "PLAYER_GUIDE",
  "SIGNUP",
  "OTHER",
] as const;
type LarpLinkType = (typeof linkTypes)[number];
const linkTypeSet: Set<string> = new Set(linkTypes);

const LarpLinkSchema = z.object({
  href: z.string(),
  // Unknown link types (a Larpit.fi addition this code does not know about yet) fall back to the
  // generic label rather than failing the whole page.
  type: z.preprocess(
    (value) => (linkTypeSet.has(String(value)) ? value : "OTHER"),
    z.enum(linkTypes),
  ),
  title: z.string().nullable(),
});

const LarpSchema = z.object({
  name: z.string(),
  fluffText: z.string().nullable(),
  description: z.string().nullable(),
  links: z.array(LarpLinkSchema),
});

export type Larp = z.infer<typeof LarpSchema>;

const userAgent = "Edegal/4 (+https://github.com/con2/edegal)";
const fetchTimeoutMs = 5_000;

/** `null` on any non-OK response, network error, timeout or body that does not match `Larp`. */
export async function fetchLarp(
  apiUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Larp | null> {
  let response: Response;
  try {
    response = await fetchImpl(apiUrl, {
      headers: { "user-agent": userAgent, accept: "application/json" },
      signal: AbortSignal.timeout(fetchTimeoutMs),
    });
  } catch {
    return null;
  }
  if (!response.ok) return null;
  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return null;
  }
  const parsed = LarpSchema.safeParse(json);
  return parsed.success ? parsed.data : null;
}

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
