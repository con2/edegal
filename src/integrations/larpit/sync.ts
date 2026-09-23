/**
 * Fills in `eventMetadataUrl` of public top-level albums that a Larpit.fi larp links to as its
 * photos. Larpit.fi runs the reverse sync, adding a PHOTOS link to larps that an album points to.
 */

import { z } from "zod";

import { pool } from "@/prisma/pool";

import { fetchJson, larpIdFromUrl, LarpLinkSchema, larpPageUrl } from "./api";

const LarpPageSchema = z.object({
  items: z.array(z.object({ id: z.string(), links: z.array(LarpLinkSchema) })),
  nextCursor: z.string().nullable(),
});

const pageSize = 100;

export interface LarpitSyncOptions {
  /** The Larpit.fi larp listing endpoint, e.g. `https://larpit.fi/api/larp`. */
  apiUrl: string;
  /** This site's public URL; only PHOTOS links to its host are considered. */
  siteUrl: string;
  /** Only larps changed after this; omitted for a full sync. */
  updatedAfter?: Date;
  fetchImpl?: typeof fetch;
  logger?: Pick<Console, "log" | "warn">;
}

export interface LarpitSyncResult {
  updated: number;
  mismatched: number;
}

function bareHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

/** `/<slug>` of a link to a top-level album on `siteHost`, or `null` for anything else. */
export function topLevelAlbumPath(
  href: string,
  siteHost: string,
): string | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (bareHost(url.hostname) !== siteHost) return null;
  const path = url.pathname.replace(/\/$/, "");
  return /^\/[^/]+$/.test(path) ? path : null;
}

async function* larpPages(
  apiUrl: string,
  updatedAfter: Date | undefined,
  fetchImpl: typeof fetch,
) {
  let cursor: string | null = null;
  do {
    const url = new URL(apiUrl);
    url.searchParams.set("include", "links");
    url.searchParams.set("limit", String(pageSize));
    if (updatedAfter)
      url.searchParams.set("updatedAfter", updatedAfter.toISOString());
    if (cursor) url.searchParams.set("after", cursor);
    const page = await fetchJson(url.toString(), LarpPageSchema, fetchImpl);
    if (!page) throw new Error(`fetching ${url} failed`);
    yield page.items;
    cursor = page.nextCursor;
  } while (cursor);
}

interface AlbumRow {
  id: string;
  path: string;
  event_metadata_url: string;
}

export async function syncFromLarpit({
  apiUrl,
  siteUrl,
  updatedAfter,
  fetchImpl = fetch,
  logger = console,
}: LarpitSyncOptions): Promise<LarpitSyncResult> {
  const siteHost = bareHost(new URL(siteUrl).hostname);
  const larpIdsByAlbumPath = new Map<string, Set<string>>();
  for await (const larps of larpPages(apiUrl, updatedAfter, fetchImpl)) {
    for (const larp of larps) {
      for (const link of larp.links) {
        if (link.type !== "PHOTOS") continue;
        const path = topLevelAlbumPath(link.href, siteHost);
        if (!path) continue;
        const larpIds = larpIdsByAlbumPath.get(path) ?? new Set();
        larpIds.add(larp.id.toLowerCase());
        larpIdsByAlbumPath.set(path, larpIds);
      }
    }
  }

  const result: LarpitSyncResult = { updated: 0, mismatched: 0 };
  if (larpIdsByAlbumPath.size === 0) return result;

  const { rows } = await pool.query<AlbumRow>(
    `select a.id, a.path, a.event_metadata_url
     from v4_album a
     join v4_album root on root.id = a.parent_id and root.path = '/'
     where a.path = any($1::text[])
       and a.visibility = 'public'
       and root.visibility = 'public'`,
    [[...larpIdsByAlbumPath.keys()]],
  );

  for (const album of rows) {
    const larpIds = [...larpIdsByAlbumPath.get(album.path)!];
    if (larpIds.length > 1) {
      logger.warn(
        `larpit sync: album ${album.path} is the photos of several larps: ${larpIds.map(larpPageUrl).join(", ")}`,
      );
      result.mismatched++;
      continue;
    }
    const larpUrl = larpPageUrl(larpIds[0]);
    if (album.event_metadata_url === "") {
      // The emptiness check keeps a concurrent editor's or worker's value rather than overwriting
      // it. Bumping updated_at makes every process drop its cached page of the album.
      const { rowCount } = await pool.query(
        `update v4_album set event_metadata_url = $2, updated_at = now()
         where id = $1 and event_metadata_url = ''`,
        [album.id, larpUrl],
      );
      if (rowCount) {
        logger.log(`larpit sync: album ${album.path} -> ${larpUrl}`);
        result.updated++;
      }
    } else if (larpIdFromUrl(album.event_metadata_url) !== larpIds[0]) {
      logger.warn(
        `larpit sync: album ${album.path} has event metadata url ${album.event_metadata_url}, but ${larpUrl} links to it as its photos`,
      );
      result.mismatched++;
    }
  }
  return result;
}
