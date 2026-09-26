import { createHash, createHmac } from "node:crypto";

/**
 * Query-string presigning for GET (AWS Signature Version 4), done here rather than with the SDK so
 * that `MediaStorage.url()` stays synchronous. The signing date is rounded down to the start of
 * the UTC day and the URL is valid for three days, so every URL for a file is byte-identical all
 * day (browsers cache it; the album cache may hold it for an hour) while still valid for at least
 * two more days after minting. `presign.test.ts` pins the output to the SDK's signer.
 */

export const getUrlExpirySeconds = 3 * 24 * 60 * 60;
export const uploadUrlExpirySeconds = 15 * 60;

export interface SigningCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export interface SigningTarget {
  /** The endpoint browsers reach, e.g. `https://garage.con2.fi`. */
  endpoint: string;
  bucket: string;
  forcePathStyle: boolean;
}

export interface PresignOptions {
  signingDate: Date;
  expiresIn: number;
  responseContentDisposition?: string;
}

export function startOfUtcDay(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** RFC 3986 encoding as SigV4 wants it: `encodeURIComponent` plus the characters it leaves alone. */
function encode(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

function encodePath(path: string): string {
  return path.split("/").map(encode).join("/");
}

function sha256Hex(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex");
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

const signingKeys = new Map<string, Buffer>();

/** The per-day derived key: four HMACs, reused for every URL of the day. */
function signingKey(credentials: SigningCredentials, dateStamp: string): Buffer {
  const cacheKey = `${credentials.accessKeyId}\n${credentials.region}\n${dateStamp}`;
  let key = signingKeys.get(cacheKey);
  if (!key) {
    key = hmac(hmac(hmac(hmac(`AWS4${credentials.secretAccessKey}`, dateStamp), credentials.region), "s3"), "aws4_request");
    signingKeys.clear();
    signingKeys.set(cacheKey, key);
  }
  return key;
}

function amzDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function presignGetUrl(
  target: SigningTarget,
  credentials: SigningCredentials,
  key: string,
  options: PresignOptions,
): string {
  const endpoint = new URL(target.endpoint);
  const host = target.forcePathStyle ? endpoint.host : `${target.bucket}.${endpoint.host}`;
  const path = target.forcePathStyle ? `/${target.bucket}/${encodePath(key)}` : `/${encodePath(key)}`;
  const longDate = amzDate(options.signingDate);
  const dateStamp = longDate.slice(0, 8);
  const scope = `${dateStamp}/${credentials.region}/s3/aws4_request`;

  const query: [string, string][] = [
    ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
    ["X-Amz-Content-Sha256", "UNSIGNED-PAYLOAD"],
    ["X-Amz-Credential", `${credentials.accessKeyId}/${scope}`],
    ["X-Amz-Date", longDate],
    ["X-Amz-Expires", String(options.expiresIn)],
    ["X-Amz-SignedHeaders", "host"],
  ];
  if (options.responseContentDisposition !== undefined) {
    query.push(["response-content-disposition", options.responseContentDisposition]);
  }
  const canonicalQuery = query
    .map(([k, v]) => [encode(k), encode(v)] as const)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const canonicalRequest = ["GET", path, canonicalQuery, `host:${host}\n`, "host", "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", longDate, scope, sha256Hex(canonicalRequest)].join("\n");
  const signature = hmac(signingKey(credentials, dateStamp), stringToSign).toString("hex");

  return `${endpoint.protocol}//${host}${path}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

/** `attachment; filename=...` for a download, with the name escaped for both filename forms. */
export function attachmentDisposition(fileName: string): string {
  const ascii = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
