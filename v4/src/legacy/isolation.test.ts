import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) && !name.endsWith(".test.ts") ? [full] : [];
  });
}

describe("legacy table isolation", () => {
  it("names edegal_* tables only inside src/legacy", () => {
    const root = path.resolve(__dirname, "..");
    const offenders = sourceFiles(root)
      .filter((file) => !file.startsWith(path.join(root, "legacy")))
      .filter((file) =>
        /\bedegal_(album|picture|media|mediaspec|photographer|series|termsandconditions)\b/.test(
          readFileSync(file, "utf8"),
        ),
      );
    expect(offenders).toEqual([]);
  });
});
