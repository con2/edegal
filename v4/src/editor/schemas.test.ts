import { describe, expect, it } from "vitest";

import { AlbumFormSchema } from "./schemas";

const base = {
  title: "Root",
  eventDate: "2026-09-05",
  visibility: "public",
  body: "",
};

describe("AlbumFormSchema", () => {
  it("accepts a root album form without slug or checkboxes", () => {
    const form = AlbumFormSchema.parse(base);
    expect(form.slug).toBe("");
    expect(form.isOpenForSubalbums).toBe(false);
    expect(form.isDownloadable).toBe(false);
    expect(form.credits).toEqual([]);
    expect(form.termsId).toBe("");
  });

  it("parses checkboxes, credits JSON and event URLs", () => {
    const form = AlbumFormSchema.parse({
      ...base,
      slug: "tracon-2026",
      isOpenForSubalbums: "true",
      isDownloadable: "on",
      ordering: "5",
      eventMetadataUrl: "https://kompassi.eu/events/tracon2026",
      credits: JSON.stringify([
        {
          photographerId: "01a08c86-8cc0-73b8-a0d8-9628adf5beeb",
          isCopyright: true,
          description: "",
        },
      ]),
    });
    expect(form.isOpenForSubalbums).toBe(true);
    expect(form.ordering).toBe(5);
    expect(form.credits).toHaveLength(1);
  });

  it("rejects bad slugs and foreign event URLs", () => {
    expect(() =>
      AlbumFormSchema.parse({ ...base, slug: "Not Valid" }),
    ).toThrow();
    expect(() =>
      AlbumFormSchema.parse({
        ...base,
        eventMetadataUrl: "https://example.com/x",
      }),
    ).toThrow();
  });
});
