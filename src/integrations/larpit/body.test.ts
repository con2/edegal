import { describe, expect, it } from "vitest";

import type { Translations } from "@/translations";

import type { Larp } from "./api";
import { larpBody } from "./body";

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
