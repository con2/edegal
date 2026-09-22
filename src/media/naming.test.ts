import { describe, expect, it } from "vitest";

import { filenameStem, parseOrderingNumber, slugifyFilename, uniqueSlug } from "./naming";

describe("filename helpers", () => {
  it("derives stems and slugs like the legacy importer", () => {
    expect(filenameStem("/tmp/DSC_0330.JPG")).toBe("DSC_0330");
    expect(slugifyFilename("DSC_0330.JPG")).toBe("dsc-0330");
    expect(slugifyFilename("Ääkköset ja välit.jpeg")).toBe("aakkoset-ja-valit");
    expect(slugifyFilename("???.jpg")).toBe("photo");
  });

  it("parses ordering numbers, preferring a trailing number", () => {
    expect(parseOrderingNumber("DSC_0330.jpg")).toBe(330);
    expect(parseOrderingNumber("Mars2175_Tomi-50.jpg")).toBe(50);
    expect(parseOrderingNumber("Horisontti (93).JPG")).toBe(93);
    expect(parseOrderingNumber("img-9998")).toBe(9998);
    expect(parseOrderingNumber("portrait.jpg")).toBeNull();
  });

  it("suffixes taken slugs", () => {
    const taken = new Set(["japsu", "japsu-2"]);
    expect(uniqueSlug("japsu", taken)).toBe("japsu-3");
    expect(uniqueSlug("other", taken)).toBe("other");
  });
});
