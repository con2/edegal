import { randomUUID } from "node:crypto";

import { mediaStorage } from "./storage";

/**
 * Error codes that say the worker's surroundings are broken (a mount gone read-only or stale,
 * storage or database unreachable, the process out of resources) rather than the photo being bad.
 * Retrying such a job right away only fails it again.
 */
const environmentErrorCodes = new Set([
  "EROFS",
  "ESTALE",
  "EIO",
  "ENOSPC",
  "EDQUOT",
  "EMFILE",
  "ENFILE",
  "ENOMEM",
  "ENOTCONN",
  "ETIMEDOUT",
  "EHOSTDOWN",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
  "EAI_AGAIN",
]);

/** Walks the `cause` chain, so a wrapped system error still counts. */
export function isEnvironmentError(error: unknown): boolean {
  for (let current = error; current instanceof Object; current = (current as { cause?: unknown }).cause) {
    const { code, $metadata } = current as { code?: unknown; $metadata?: { httpStatusCode?: number } };
    if (typeof code === "string" && environmentErrorCodes.has(code)) return true;
    // The S3 client reports a failing server (Garage down or overloaded) as a 5xx response.
    if (($metadata?.httpStatusCode ?? 0) >= 500) return true;
  }
  return false;
}

/** A job failed because of the worker's surroundings; the worker should stop taking jobs. */
export class WorkerEnvironmentError extends Error {
  constructor(message: string, options: { cause: unknown }) {
    super(message, options);
    this.name = "WorkerEnvironmentError";
  }
}

/** Writes and removes a small file where new media goes. */
export async function checkMediaWritable(): Promise<void> {
  const key = `.worker-write-check-${randomUUID()}`;
  await mediaStorage.put(key, Buffer.from("ok"), "text/plain");
  await mediaStorage.delete(key);
}
