/** Client for the public JSON API of Larpit.fi (https://larpit.fi/api-docs). */

import { z } from "zod";

const larpIdPathRegex =
  /^\/larp\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/?$/i;
const larpAliasPathRegex = /^\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/i;

/**
 * The larp id of `https://larpit.fi/larp/<uuid>` or the alias of `https://larpit.fi/<alias>`
 * (optionally `www.`, a trailing slash, a query), lowercased. The Larpit.fi API takes either.
 */
export function larpKeyFromUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  if (parsed.hostname !== "larpit.fi" && parsed.hostname !== "www.larpit.fi")
    return null;
  const match =
    parsed.pathname.match(larpIdPathRegex) ??
    parsed.pathname.match(larpAliasPathRegex);
  return match ? match[1].toLowerCase() : null;
}

export function larpPageUrl(larpId: string): string {
  return `https://larpit.fi/larp/${larpId}`;
}

/** A Larpit.fi larp page URL, as accepted by `larpKeyFromUrl`, to its API URL. */
export function larpitApiUrl(eventMetadataUrl: string): string | null {
  const larpKey = larpKeyFromUrl(eventMetadataUrl);
  return larpKey ? `https://larpit.fi/api/larp/${larpKey}` : null;
}

export const linkTypes = [
  "HOMEPAGE",
  "PHOTOS",
  "SOCIAL_MEDIA",
  "PLAYER_GUIDE",
  "SIGNUP",
  "OTHER",
] as const;
export type LarpLinkType = (typeof linkTypes)[number];
const linkTypeSet: Set<string> = new Set(linkTypes);

export const LarpLinkSchema = z.object({
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
  startsAt: z.string().nullable(),
  endsAt: z.string().nullable(),
  locationText: z.string().nullable(),
  municipality: z.string().nullable(),
  links: z.array(LarpLinkSchema),
});

export type Larp = z.infer<typeof LarpSchema>;

const userAgent = "Edegal/4 (+https://github.com/con2/edegal)";
const fetchTimeoutMs = 5_000;

/** `null` on any non-OK response, network error, timeout or body that does not match `schema`. */
export async function fetchJson<T>(
  url: string,
  schema: z.ZodType<T>,
  fetchImpl: typeof fetch = fetch,
): Promise<T | null> {
  let response: Response;
  try {
    response = await fetchImpl(url, {
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
  const parsed = schema.safeParse(json);
  return parsed.success ? parsed.data : null;
}

export async function fetchLarp(
  apiUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Larp | null> {
  return fetchJson(apiUrl, LarpSchema, fetchImpl);
}
