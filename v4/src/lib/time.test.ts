import { describe, expect, it } from "vitest";

import { pgTimestampToIso } from "./time";

describe("pgTimestampToIso", () => {
  it("parses PostgreSQL text timestamps with hour offsets", () => {
    expect(pgTimestampToIso("2026-09-10 19:59:34.726+03")).toBe(
      "2026-09-10T16:59:34.726Z",
    );
  });

  it("parses offsets with minutes and no fraction", () => {
    expect(pgTimestampToIso("2026-01-01 00:00:00+05:30")).toBe(
      "2025-12-31T18:30:00.000Z",
    );
  });
});
