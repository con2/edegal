import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { pool } from "@/prisma/pool";
import { db } from "@/prisma/db";

import { syncFromLarpit } from "./sync";

const apiUrl = "https://larpit.fi/api/larp";
const siteUrl = "https://larppikuvat.fi";

const larpA = "019c1910-828b-7147-86c5-bf110d208138";
const larpB = "019c1910-828b-7147-86c5-bf110d208139";
const larpC = "019c1910-828b-7147-86c5-bf110d20813a";
const larpD = "019c1910-828b-7147-86c5-bf110d20813b";
const larpE = "019c1910-828b-7147-86c5-bf110d20813c";

function photos(href: string) {
  return { href, type: "PHOTOS", title: null };
}

function jsonResponse(body: unknown): Response {
  return { ok: true, json: async () => body } as unknown as Response;
}

async function eventMetadataUrl(path: string): Promise<string> {
  const album = await db.orm.public.Album.where({ path })
    .select("eventMetadataUrl")
    .first();
  return album!.eventMetadataUrl;
}

beforeAll(async () => {
  await pool.query(`truncate v4_photo, v4_album cascade`);
  const root = await db.orm.public.Album.create({
    slug: "",
    path: "/",
    title: "Root",
  });
  const top = (slug: string, extra: object = {}) =>
    db.orm.public.Album.create({
      parentId: root.id,
      slug,
      path: `/${slug}`,
      title: slug,
      ...extra,
    });
  await top("empty");
  await top("hidden", { visibility: "hidden" });
  await top("linked", { eventMetadataUrl: `https://larpit.fi/larp/${larpC}` });
  await top("conflicting", {
    eventMetadataUrl:
      "https://larpit.fi/larp/019c0000-0000-7000-8000-000000000000",
  });
  await top("shared");
  const event = await top("event");
  await db.orm.public.Album.create({
    parentId: event.id,
    slug: "day-1",
    path: "/event/day-1",
    title: "Day 1",
  });
});

afterAll(async () => {
  await db.close();
  await pool.end();
});

describe("syncFromLarpit", () => {
  it("fills in empty event metadata urls of public top-level albums and warns about conflicts", async () => {
    const requested: string[] = [];
    const pages = [
      {
        items: [
          {
            id: larpA,
            links: [
              { href: "https://example.com/", type: "HOMEPAGE", title: null },
              photos("https://www.larppikuvat.fi/empty/"),
              photos("https://larppikuvat.fi/event/day-1"),
            ],
          },
          { id: larpB, links: [photos("https://larppikuvat.fi/hidden")] },
        ],
        nextCursor: "page-2",
      },
      {
        items: [
          { id: larpC, links: [photos("https://larppikuvat.fi/linked")] },
          { id: larpD, links: [photos("https://larppikuvat.fi/conflicting")] },
          { id: larpD, links: [photos("https://larppikuvat.fi/shared")] },
          { id: larpE, links: [photos("https://larppikuvat.fi/shared")] },
        ],
        nextCursor: null,
      },
    ];
    const fetchImpl = (async (url: string) => {
      requested.push(url);
      return jsonResponse(pages[requested.length - 1]);
    }) as typeof fetch;
    const logger = { log: vi.fn(), warn: vi.fn() };

    const result = await syncFromLarpit({
      apiUrl,
      siteUrl,
      updatedAfter: new Date("2026-09-01T00:00:00Z"),
      fetchImpl,
      logger,
    });

    expect(requested).toEqual([
      `${apiUrl}?include=links&limit=100&updatedAfter=2026-09-01T00%3A00%3A00.000Z`,
      `${apiUrl}?include=links&limit=100&updatedAfter=2026-09-01T00%3A00%3A00.000Z&after=page-2`,
    ]);
    expect(result).toEqual({ updated: 1, mismatched: 2 });
    expect(await eventMetadataUrl("/empty")).toBe(
      `https://larpit.fi/larp/${larpA}`,
    );
    // Hidden albums and albums below the top level are never written.
    expect(await eventMetadataUrl("/hidden")).toBe("");
    expect(await eventMetadataUrl("/event/day-1")).toBe("");
    // An album claimed by two larps is left alone rather than guessed.
    expect(await eventMetadataUrl("/shared")).toBe("");
    expect(await eventMetadataUrl("/conflicting")).toBe(
      "https://larpit.fi/larp/019c0000-0000-7000-8000-000000000000",
    );
    expect(logger.warn).toHaveBeenCalledTimes(2);
    expect(logger.warn.mock.calls.flat().join("\n")).toMatch(/\/conflicting/);
    expect(logger.warn.mock.calls.flat().join("\n")).toMatch(/\/shared/);
  });

  it("throws when a page cannot be fetched", async () => {
    const fetchImpl = (async () =>
      ({ ok: false }) as unknown as Response) as typeof fetch;
    await expect(
      syncFromLarpit({ apiUrl, siteUrl, fetchImpl, logger: console }),
    ).rejects.toThrow(/fetching/);
  });
});
