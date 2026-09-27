import { describe, expect, it } from "vitest";

import { isEnvironmentError } from "./workerHealth";

function systemError(code: string) {
  return Object.assign(new Error(`${code}: something`), { code });
}

describe("isEnvironmentError", () => {
  it("recognizes a broken mount, also when wrapped", () => {
    expect(isEnvironmentError(systemError("EROFS"))).toBe(true);
    expect(isEnvironmentError(new Error("write failed", { cause: systemError("ESTALE") }))).toBe(true);
  });

  it("recognizes an S3 server error by its status", () => {
    expect(isEnvironmentError(Object.assign(new Error("ServiceUnavailable"), { $metadata: { httpStatusCode: 503 } }))).toBe(true);
    expect(isEnvironmentError(Object.assign(new Error("NoSuchKey"), { $metadata: { httpStatusCode: 404 } }))).toBe(false);
  });

  // A missing original or an undecodable file is the photo's problem and must go through the
  // normal retries; a per-file permission problem would otherwise restart the worker forever.
  it("leaves errors about a single photo alone", () => {
    expect(isEnvironmentError(systemError("ENOENT"))).toBe(false);
    expect(isEnvironmentError(systemError("EACCES"))).toBe(false);
    expect(isEnvironmentError(new Error("Input buffer contains unsupported image format"))).toBe(false);
    expect(isEnvironmentError("not an error")).toBe(false);
  });
});
