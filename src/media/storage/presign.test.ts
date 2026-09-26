import { createHash, createHmac, type Hash, type Hmac } from "node:crypto";

import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { HttpRequest } from "@smithy/protocol-http";
import type { Hash as SdkHash, SourceData } from "@smithy/types";
import { describe, expect, it } from "vitest";

import { attachmentDisposition, getUrlExpirySeconds, presignGetUrl, startOfUtcDay } from "./presign";

/** The SDK signer takes a hash constructor, called with a key for its HMAC steps; Node's crypto stands in for @aws-crypto/sha256-js. */
class NodeSha256 implements SdkHash {
  private readonly hash: Hash | Hmac;
  constructor(secret?: SourceData) {
    this.hash = secret === undefined ? createHash("sha256") : createHmac("sha256", binary(secret));
  }
  update(data: SourceData) {
    this.hash.update(binary(data));
  }
  async digest() {
    return new Uint8Array(this.hash.digest());
  }
}

function binary(data: SourceData): string | Uint8Array {
  if (typeof data === "string") return data;
  return data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
}

const target = { endpoint: "https://garage.example.com:8443", bucket: "edegal", forcePathStyle: true };
const credentials = { accessKeyId: "GKtestkey", secretAccessKey: "testsecret", region: "garage" };
const signingDate = new Date("2026-09-26T00:00:00Z");

/** What `@aws-sdk/s3-request-presigner` produces for the same request, minus the SDK's `x-id` marker. */
async function reference(key: string, query: Record<string, string> = {}): Promise<URL> {
  const presigner = new S3RequestPresigner({ credentials, region: credentials.region, sha256: NodeSha256 });
  const endpoint = new URL(target.endpoint);
  const request = new HttpRequest({
    protocol: endpoint.protocol,
    hostname: endpoint.hostname,
    port: Number(endpoint.port) || undefined,
    method: "GET",
    path: `/${target.bucket}/${key.split("/").map(encodeURIComponent).join("/")}`,
    headers: { host: endpoint.host },
    query,
  });
  const signed = await presigner.presign(request, { signingDate, expiresIn: getUrlExpirySeconds });
  const url = new URL(`${signed.protocol}//${signed.headers.host}${signed.path}`);
  for (const [name, value] of Object.entries(signed.query ?? {})) url.searchParams.set(name, String(value));
  return url;
}

function normalized(url: URL) {
  return { host: url.host, pathname: url.pathname, query: [...url.searchParams.entries()].sort() };
}

describe("presignGetUrl", () => {
  it("matches the SDK presigner for a plain key", async () => {
    const key = "previews/tapahtuma 2026/kuva-1.avif";
    const mine = new URL(presignGetUrl(target, credentials, key, { signingDate, expiresIn: getUrlExpirySeconds }));
    expect(normalized(mine)).toEqual(normalized(await reference(key)));
    expect(mine.searchParams.get("X-Amz-Date")).toBe("20260926T000000Z");
    expect(mine.searchParams.get("X-Amz-Expires")).toBe(String(getUrlExpirySeconds));
  });

  it("matches the SDK presigner with a download disposition", async () => {
    const key = "pictures/event/dsc-0001.jpeg";
    const disposition = attachmentDisposition("Ääkkös kuva.jpg");
    const mine = new URL(
      presignGetUrl(target, credentials, key, { signingDate, expiresIn: getUrlExpirySeconds, responseContentDisposition: disposition }),
    );
    expect(normalized(mine)).toEqual(normalized(await reference(key, { "response-content-disposition": disposition })));
    expect(mine.searchParams.get("response-content-disposition")).toBe(disposition);
  });

  it("signs virtual-hosted style against the bucket host", () => {
    const url = new URL(presignGetUrl({ ...target, forcePathStyle: false }, credentials, "a/b.jpeg", { signingDate, expiresIn: 60 }));
    expect(url.host).toBe("edegal.garage.example.com:8443");
    expect(url.pathname).toBe("/a/b.jpeg");
  });
});

describe("startOfUtcDay", () => {
  it("rounds down to midnight UTC so URLs stay identical within a day", () => {
    expect(startOfUtcDay(new Date("2026-09-26T23:59:59.999Z")).toISOString()).toBe("2026-09-26T00:00:00.000Z");
    expect(startOfUtcDay(new Date("2026-09-27T00:00:00.000Z")).toISOString()).toBe("2026-09-27T00:00:00.000Z");
  });
});

describe("attachmentDisposition", () => {
  it("offers an ASCII fallback and the UTF-8 form", () => {
    expect(attachmentDisposition('kuva "1".jpg')).toBe(`attachment; filename="kuva _1_.jpg"; filename*=UTF-8''kuva%20%221%22.jpg`);
  });
});
