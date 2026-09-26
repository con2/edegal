import type { Readable } from "node:stream";

import { mediaRoot, s3 } from "@/config";

import { LocalMediaStorage } from "./local";
import { S3MediaStorage } from "./s3";

/** Where a media file lives; matches the `MediaBackend` enum of the contract. */
export type MediaBackend = "fs" | "s3";

export interface MediaStat {
  size: number;
  mtime: Date;
}

/** Inclusive end offset of a prefix read; the S3 backend sends it as a Range header. */
export interface ByteRange {
  end: number;
}

export interface UrlOptions {
  /** Makes the URL save as a file under this name instead of displaying inline. */
  downloadName?: string;
}

export interface PresignedUpload {
  url: string;
  /** Headers the browser must send with the PUT, since they are part of the signature. */
  headers: Record<string, string>;
}

export interface ListedObject {
  key: string;
  lastModified: Date;
}

/**
 * Media files are addressed by storage key (`pictures/...`, `previews/...`, `thumbnails/...`,
 * and `uploads/...` for files a browser sent straight to the bucket).
 */
export interface MediaStorage {
  readonly backend: MediaBackend;
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  /** Streams a file in; `size` lets a backend skip buffering when it needs the length up front. */
  putStream(key: string, stream: Readable, contentType: string, size?: number): Promise<void>;
  /** Copies within the same storage without passing the bytes through this process. */
  copy(fromKey: string, toKey: string, contentType: string): Promise<void>;
  stat(key: string): Promise<MediaStat | null>;
  /** The file's bytes, or only its first `range.end + 1` bytes when a range is given. */
  getStream(key: string, range?: ByteRange): Promise<Readable>;
  /** Removes the file; a missing file is not an error. */
  delete(key: string): Promise<void>;
  /**
   * Where a browser fetches the file. Synchronous so view models can be built without async
   * plumbing; the S3 backend signs locally.
   */
  url(key: string, options?: UrlOptions): string;
  /** A URL a browser may PUT the file to directly, or null when the backend has no such thing. */
  presignUpload(key: string, contentType: string, size: number): Promise<PresignedUpload | null>;
  listPrefix(prefix: string): AsyncIterable<ListedObject>;
}

export { LocalMediaStorage } from "./local";
export { S3MediaStorage } from "./s3";

let local: LocalMediaStorage | undefined;
let remote: S3MediaStorage | undefined;

/** Both backends stay reachable side by side: rows record which one holds their file. */
export function storageFor(backend: MediaBackend): MediaStorage {
  if (backend === "fs") return (local ??= new LocalMediaStorage(mediaRoot));
  if (!s3.bucket) throw new Error("S3 media storage is not configured (S3_BUCKET is empty)");
  return (remote ??= new S3MediaStorage(s3));
}

/** The backend new files are written to. */
export const activeBackend: MediaBackend = s3.bucket ? "s3" : "fs";

export const mediaStorage: MediaStorage = storageFor(activeBackend);
