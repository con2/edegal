import { createReadStream } from "node:fs";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Readable } from "node:stream";

import { mediaRoot } from "@/config";

export interface MediaStat {
  size: number;
  mtime: Date;
}

/** Inclusive end offset of a prefix read; an S3 backend would send it as a Range header. */
export interface ByteRange {
  end: number;
}

/**
 * Media files are addressed by storage key (`pictures/...`, `previews/...`, `thumbnails/...`).
 * The local implementation is the only one for now; an S3-compatible one can replace it without
 * touching callers.
 */
export interface MediaStorage {
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  stat(key: string): Promise<MediaStat | null>;
  /** The file's bytes, or only its first `range.end + 1` bytes when a range is given. */
  getStream(key: string, range?: ByteRange): Readable;
  /** Removes the file; a missing file is not an error. */
  delete(key: string): Promise<void>;
}

export class LocalMediaStorage implements MediaStorage {
  constructor(private readonly root: string) {}

  /** Resolves a key inside the root, refusing keys that would escape it. */
  resolve(key: string): string {
    const resolved = path.resolve(this.root, key.replace(/^\/+/, ""));
    const rootWithSep = path.resolve(this.root) + path.sep;
    if (!resolved.startsWith(rootWithSep)) {
      throw new Error(`storage key escapes media root: ${key}`);
    }
    return resolved;
  }

  async put(key: string, data: Buffer): Promise<void> {
    const target = this.resolve(key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, data);
  }

  async stat(key: string): Promise<MediaStat | null> {
    try {
      const s = await stat(this.resolve(key));
      return s.isFile() ? { size: s.size, mtime: s.mtime } : null;
    } catch {
      return null;
    }
  }

  getStream(key: string, range?: ByteRange): Readable {
    return createReadStream(this.resolve(key), range ? { start: 0, end: range.end } : undefined);
  }

  async delete(key: string): Promise<void> {
    await rm(this.resolve(key), { force: true });
  }
}

export const mediaStorage: MediaStorage = new LocalMediaStorage(mediaRoot);
