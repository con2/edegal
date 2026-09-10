import { describe, expect, it } from "vitest";

import { creditLines, deriveHandles, platformsWithHandles } from "./credits";

const links = [
  { href: "https://example.com", title: "Homepage" },
  { href: "https://twitter.com/shooter", title: "Twitter" },
  { href: "https://www.instagram.com/shooter.photo/", title: "Instagram" },
  { href: "https://www.threads.net/@shooter", title: "Threads" },
  { href: "https://bsky.app/profile/shooter.bsky.social", title: "Bluesky" },
  { href: "not a url", title: "Broken" },
];

describe("deriveHandles", () => {
  it("reads handles from known profile URLs and ignores the rest", () => {
    expect(deriveHandles(links)).toEqual({
      twitter: "shooter",
      instagram: "shooter.photo",
      threads: "shooter",
      bluesky: "shooter.bsky.social",
    });
  });

  it("treats x.com as Twitter", () => {
    expect(deriveHandles([{ href: "https://x.com/someone" }])).toEqual({
      twitter: "someone",
    });
  });
});

describe("creditLines", () => {
  const credits = [
    {
      displayName: "Assistant",
      path: null,
      isCopyright: false,
      description: "director",
      links: [],
    },
    {
      displayName: "Shooter",
      path: null,
      isCopyright: true,
      description: "",
      links,
    },
  ];

  it("puts copyright holders first and fills in handles per platform", () => {
    expect(creditLines(credits, "instagram")).toEqual([
      {
        displayName: "Shooter",
        isCopyright: true,
        description: "",
        handle: "shooter.photo",
      },
      {
        displayName: "Assistant",
        isCopyright: false,
        description: "director",
        handle: null,
      },
    ]);
  });

  it("lists only platforms someone has a profile on, in display order", () => {
    expect(platformsWithHandles(credits)).toEqual([
      "twitter",
      "instagram",
      "threads",
      "bluesky",
    ]);
    expect(platformsWithHandles([credits[0]])).toEqual([]);
  });
});
