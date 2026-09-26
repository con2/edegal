import { describe, expect, it } from "vitest";

import { fetchLarp, larpitApiUrl } from "./api";

const eventUrl = "https://larpit.fi/larp/019c1910-828b-7147-86c5-bf110d208138";

describe("larpitApiUrl", () => {
  it("maps a larp page to its api url, www. and trailing slash and query tolerated", () => {
    expect(larpitApiUrl(eventUrl)).toBe(
      "https://larpit.fi/api/larp/019c1910-828b-7147-86c5-bf110d208138",
    );
    expect(
      larpitApiUrl(
        `https://www.larpit.fi/larp/019c1910-828b-7147-86c5-bf110d208138/`,
      ),
    ).toBe("https://larpit.fi/api/larp/019c1910-828b-7147-86c5-bf110d208138");
    expect(larpitApiUrl(`${eventUrl}?utm_source=newsletter`)).toBe(
      "https://larpit.fi/api/larp/019c1910-828b-7147-86c5-bf110d208138",
    );
  });

  it("rejects anything that is not a larpit.fi larp page", () => {
    expect(larpitApiUrl("")).toBeNull();
    expect(larpitApiUrl("not a url")).toBeNull();
    expect(larpitApiUrl("https://kompassi.eu/events/tracon2026")).toBeNull();
    expect(
      larpitApiUrl(
        "http://larpit.fi/larp/019c1910-828b-7147-86c5-bf110d208138",
      ),
    ).toBeNull();
    expect(larpitApiUrl("https://larpit.fi/larp/not-a-uuid")).toBeNull();
    expect(
      larpitApiUrl(
        "https://larpit.fi/larps/019c1910-828b-7147-86c5-bf110d208138",
      ),
    ).toBeNull();
  });
});

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as unknown as Response;
}

describe("fetchLarp", () => {
  const apiUrl =
    "https://larpit.fi/api/larp/019c1910-828b-7147-86c5-bf110d208138";

  it("returns the parsed larp on a valid response", async () => {
    const body = {
      name: "Korpkvädet",
      fluffText: "Fluff",
      description: null,
      startsAt: "2026-06-02",
      endsAt: "2026-06-05",
      locationText: "Piilopirtti",
      municipality: "Tampere",
      links: [{ href: "https://x.example/", type: "HOMEPAGE", title: null }],
    };
    const larp = await fetchLarp(apiUrl, async () => jsonResponse(body));
    expect(larp).toEqual(body);
  });

  it("returns null on a non-ok response", async () => {
    const larp = await fetchLarp(apiUrl, async () => jsonResponse({}, false));
    expect(larp).toBeNull();
  });

  it("returns null when the request throws (network error or timeout)", async () => {
    const larp = await fetchLarp(apiUrl, async () => {
      throw new DOMException("The operation was aborted", "TimeoutError");
    });
    expect(larp).toBeNull();
  });

  it("returns null on a body that is not valid json", async () => {
    const larp = await fetchLarp(
      apiUrl,
      async () =>
        ({
          ok: true,
          json: async () => {
            throw new SyntaxError("Unexpected token");
          },
        }) as unknown as Response,
    );
    expect(larp).toBeNull();
  });

  it("returns null when the body does not match the expected shape", async () => {
    const larp = await fetchLarp(apiUrl, async () =>
      jsonResponse({ nope: true }),
    );
    expect(larp).toBeNull();
  });
});
