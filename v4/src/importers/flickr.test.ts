import { describe, expect, it } from "vitest";

import {
  albumFromOpenGraph,
  coverFilename,
  decodeEntities,
  isFlickrUrl,
  parseOpenGraph,
  removeKnownSuffixes,
  splitDateFromTitle,
} from "./flickr";

const page = `<!doctype html><html><head>
<meta charset="utf-8">
<meta content="Korpkv&#228;det (LARP)" property="og:title">
<meta property="og:description" content="Photos from the run &amp; the afterparty" />
<meta property='og:url' content='https://www.flickr.com/photos/someone/albums/72177720312345678'>
<meta property="og:image" content="https://live.staticflickr.com/65535/54321_abcdef_b.jpg">
<meta property="og:image" content="https://live.staticflickr.com/65535/second_b.jpg">
</head><body></body></html>`;

describe("parseOpenGraph", () => {
  it("reads og tags regardless of attribute order and quoting, first occurrence winning", () => {
    const og = parseOpenGraph(page);
    expect(og.get("og:title")).toBe("Korpkvädet (LARP)");
    expect(og.get("og:description")).toBe(
      "Photos from the run & the afterparty",
    );
    expect(og.get("og:url")).toBe(
      "https://www.flickr.com/photos/someone/albums/72177720312345678",
    );
    expect(og.get("og:image")).toBe(
      "https://live.staticflickr.com/65535/54321_abcdef_b.jpg",
    );
  });

  it("ignores meta tags that are not Open Graph", () => {
    expect(
      parseOpenGraph('<meta name="viewport" content="width=device-width">')
        .size,
    ).toBe(0);
  });
});

describe("decodeEntities", () => {
  it("decodes named, decimal and hex entities and leaves unknown ones alone", () => {
    expect(decodeEntities("a &amp; b &#39;c&#x27; &nbsp;&bogus;")).toBe(
      "a & b 'c' \u00a0&bogus;",
    );
  });
});

describe("albumFromOpenGraph", () => {
  it("drops Flickr's placeholder description and off-Flickr images", () => {
    const og = new Map([
      ["og:title", "Run 3"],
      ["og:url", "https://www.flickr.com/photos/x/albums/1"],
      ["og:description", "Explore this photo album by Someone on Flickr!"],
      ["og:image", "https://evil.example/pic.jpg"],
    ]);
    expect(albumFromOpenGraph(og)).toEqual({
      title: "Run 3",
      description: "",
      url: "https://www.flickr.com/photos/x/albums/1",
      imageUrl: null,
    });
  });

  it("needs a title and a Flickr url", () => {
    expect(albumFromOpenGraph(new Map([["og:title", "x"]]))).toBeNull();
    expect(
      albumFromOpenGraph(
        new Map([
          ["og:title", "x"],
          ["og:url", "https://example.com/"],
        ]),
      ),
    ).toBeNull();
  });
});

describe("title handling", () => {
  it("removes the (LARP) tag", () => {
    expect(removeKnownSuffixes("Korpkvädet (LARP)")).toBe("Korpkvädet");
    expect(removeKnownSuffixes("Korpkvädet")).toBe("Korpkvädet");
  });

  it("lifts an ISO or Finnish date out of the title", () => {
    expect(splitDateFromTitle("Korpkvädet 14.3.2026")).toEqual({
      title: "Korpkvädet",
      eventDate: "2026-03-14",
    });
    expect(splitDateFromTitle("2026-03-14 – Korpkvädet")).toEqual({
      title: "Korpkvädet",
      eventDate: "2026-03-14",
    });
    expect(splitDateFromTitle("Korpkvädet run 3")).toEqual({
      title: "Korpkvädet run 3",
      eventDate: null,
    });
  });

  it("leaves impossible dates in the title", () => {
    expect(splitDateFromTitle("Con 31.2.2026")).toEqual({
      title: "Con 31.2.2026",
      eventDate: null,
    });
  });
});

describe("urls", () => {
  it("accepts Flickr hosts only", () => {
    expect(isFlickrUrl("https://www.flickr.com/photos/x/albums/1")).toBe(true);
    expect(isFlickrUrl("https://flic.kr/s/aHBqjBdq1x")).toBe(true);
    expect(isFlickrUrl("https://flickr.com.evil.example/")).toBe(false);
    expect(isFlickrUrl("javascript:alert(1)")).toBe(false);
    expect(isFlickrUrl("not a url")).toBe(false);
  });

  it("names the cover after the image file", () => {
    expect(
      coverFilename("https://live.staticflickr.com/65535/54321_abcdef_b.jpg"),
    ).toBe("54321_abcdef_b.jpg");
  });
});
