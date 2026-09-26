import { createReadStream, createWriteStream } from "node:fs";
import { copyFile, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import { mediaBaseUrl } from "@/config";

import type { ByteRange, ListedObject, MediaStat, MediaStorage, UrlOptions } from "./index";

/** Files under a directory (`MEDIA_ROOT`, the NFS export in production), served at `mediaBaseUrl`. */
export class LocalMediaStorage implements MediaStorage {
  readonly backend = "fs" as const;

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

  private async prepare(key: string): Promise<string> {
    const target = this.resolve(key);
    await mkdir(path.dirname(target), { recursive: true });
    return target;
  }

  async put(key: string, data: Buffer): Promise<void> {
    await writeFile(await this.prepare(key), data);
  }

  async putStream(key: string, stream: Readable): Promise<void> {
    await pipeline(stream, createWriteStream(await this.prepare(key)));
  }

  async copy(fromKey: string, toKey: string): Promise<void> {
    await copyFile(this.resolve(fromKey), await this.prepare(toKey));
  }

  async stat(key: string): Promise<MediaStat | null> {
    try {
      const s = await stat(this.resolve(key));
      return s.isFile() ? { size: s.size, mtime: s.mtime } : null;
    } catch {
      return null;
    }
  }

  async getStream(key: string, range?: ByteRange): Promise<Readable> {
    return createReadStream(this.resolve(key), range ? { start: 0, end: range.end } : undefined);
  }

  async delete(key: string): Promise<void> {
    await rm(this.resolve(key), { force: true });
  }

  /** The download name is left to the `download` attribute: the URL is same-origin. */
  url(key: string, _options?: UrlOptions): string {
    return `${mediaBaseUrl}/${key.replace(/^\/+/, "")}`;
  }

  async presignUpload(): Promise<null> {
    return null;
  }

  async *listPrefix(prefix: string): AsyncIterable<ListedObject> {
    const directory = this.resolve(prefix);
    let entries;
    try {
      entries = await readdir(directory, { recursive: true, withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const file = path.join(entry.parentPath, entry.name);
      const { mtime } = await stat(file);
      yield { key: path.relative(path.resolve(this.root), file).split(path.sep).join("/"), lastModified: mtime };
    }
  }
}
