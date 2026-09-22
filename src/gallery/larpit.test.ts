import { describe, expect, it } from "vitest";

import type { Translations } from "@/translations";

import { fetchLarp, larpBody, larpitApiUrl, type Larp } from "./larpit";

const t: Translations["LarpitBody"] = {
  thisLarpInLarpit: "This larp in Larpit.fi",
  homepage: "Home page of the larp",
  photos: "Photos",
  socialMedia: "Social media",
  playerGuide: "Player guide",
  signup: "Sign up",
  other: "More information",
};

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

describe("larpBody", () => {
  const larp: Larp = {
    name: "Korpkvädet",
    fluffText: "Paragraph one.\n\nParagraph two.\n\n\n",
    description: "**Bring** warm clothes.",
    links: [
      { href: "https://korpkvadet.example/", type: "HOMEPAGE", title: null },
      {
        href: "https://larppikuvat.fi/korpkvadet",
        type: "PHOTOS",
        title: null,
      },
      {
        href: "https://otherphotos.example/korpkvadet",
        type: "PHOTOS",
        title: "Extra gallery",
      },
      { href: "https://discord.example/x", type: "SOCIAL_MEDIA", title: null },
    ],
  };

  it("lays out heading, fluff paragraphs, description and links; skips the site's own PHOTOS link", () => {
    expect(larpBody(larp, eventUrl, t)).toBe(
      [
        "# Korpkvädet",
        "*Paragraph one\\.*",
        "*Paragraph two\\.*",
        "**Bring** warm clothes.",
        [
          `[This larp in Larpit.fi](${eventUrl})`,
          "[Home page of the larp](https://korpkvadet.example/)",
          "[Extra gallery](https://otherphotos.example/korpkvadet)",
          "[Social media](https://discord.example/x)",
        ].join("  \n"),
      ].join("\n\n"),
    );
  });

  it("escapes markdown-significant punctuation in the name and fluff, but not the description", () => {
    const larpWithMarkup: Larp = {
      name: "*Not a heading* [link](evil)",
      fluffText: "_not italic_ # not a heading",
      description: "# A real heading",
      links: [],
    };
    const body = larpBody(larpWithMarkup, eventUrl, t);
    expect(body).toContain("# \\*Not a heading\\* \\[link\\]\\(evil\\)");
    expect(body).toContain("*\\_not italic\\_ \\# not a heading*");
    expect(body).toContain("# A real heading");
  });

  it("omits fluff and description sections when absent", () => {
    const bare: Larp = {
      name: "Bare",
      fluffText: null,
      description: null,
      links: [],
    };
    expect(larpBody(bare, eventUrl, t)).toBe(
      ["# Bare", `[This larp in Larpit.fi](${eventUrl})`].join("\n\n"),
    );
  });

  it("labels an unrecognized link type with the generic translation", () => {
    const larpWithUnknownType: Larp = {
      name: "N",
      fluffText: null,
      description: null,
      // Simulates a link type Larpit.fi added after this schema was written.
      links: [{ href: "https://example.com/", type: "OTHER", title: null }],
    };
    expect(larpBody(larpWithUnknownType, eventUrl, t)).toContain(
      "[More information](https://example.com/)",
    );
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
