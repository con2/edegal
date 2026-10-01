import type { Readable } from "node:stream";

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import type { ByteRange, ListedObject, MediaStat, MediaStorage, PresignedUpload, UrlOptions } from "./index";
import { attachmentDisposition, getUrlExpirySeconds, presignGetUrl, startOfUtcDay, uploadUrlExpirySeconds } from "./presign";

export interface S3Settings {
  bucket: string;
  endpoint: string;
  publicEndpoint: string;
  region: string;
  forcePathStyle: boolean;
  accessKeyId: string;
  secretAccessKey: string;
}

function isNotFound(error: unknown): boolean {
  const e = error as { name?: string; $metadata?: { httpStatusCode?: number } };
  return e.name === "NotFound" || e.name === "NoSuchKey" || e.$metadata?.httpStatusCode === 404;
}

/**
 * An S3-compatible bucket (Garage in production). Server-side calls go to `endpoint`; every URL
 * handed to a browser is presigned against `publicEndpoint`, which is how media stays reachable
 * only through authenticated requests.
 */
export class S3MediaStorage implements MediaStorage {
  readonly backend = "s3" as const;
  private readonly client: S3Client;
  /** Signs browser-facing URLs; never used for calls from here. */
  private readonly publicClient: S3Client;

  constructor(private readonly settings: S3Settings) {
    const shared = {
      region: settings.region,
      forcePathStyle: settings.forcePathStyle,
      credentials: { accessKeyId: settings.accessKeyId, secretAccessKey: settings.secretAccessKey },
    };
    // Garage answers a GET of a multipart-uploaded object with the checksum of its parts
    // combined, without the "-N" suffix S3 uses to mark one; the SDK then compares it against
    // the whole body and rejects the download. Neither side of the checksum exchange is
    // needed here, so both are off.
    this.client = new S3Client({
      ...shared,
      endpoint: settings.endpoint,
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
    // The SDK otherwise hoists a CRC32 checksum placeholder into presigned URLs, and Garage then
    // rejects the browser's body for not matching it.
    this.publicClient = new S3Client({
      ...shared,
      endpoint: settings.publicEndpoint,
      requestChecksumCalculation: "WHEN_REQUIRED",
    });
  }

  private get bucket(): string {
    return this.settings.bucket;
  }

  async put(key: string, data: Buffer, contentType: string): Promise<void> {
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: data, ContentType: contentType }));
  }

  async putStream(key: string, stream: Readable, contentType: string): Promise<void> {
    await new Upload({
      client: this.client,
      params: { Bucket: this.bucket, Key: key, Body: stream, ContentType: contentType },
    }).done();
  }

  async copy(fromKey: string, toKey: string, contentType: string): Promise<void> {
    await this.client.send(
      new CopyObjectCommand({
        Bucket: this.bucket,
        Key: toKey,
        CopySource: `${this.bucket}/${fromKey.split("/").map(encodeURIComponent).join("/")}`,
        ContentType: contentType,
        MetadataDirective: "REPLACE",
      }),
    );
  }

  async stat(key: string): Promise<MediaStat | null> {
    try {
      const head = await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return { size: head.ContentLength ?? 0, mtime: head.LastModified ?? new Date(0) };
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async getStream(key: string, range?: ByteRange): Promise<Readable> {
    const object = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key, Range: range ? `bytes=0-${range.end}` : undefined }),
    );
    if (!object.Body) throw new Error(`${key}: empty response body`);
    // In Node the SDK's body is an IncomingMessage, a Readable.
    return object.Body as Readable;
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  url(key: string, options?: UrlOptions): string {
    const { publicEndpoint, bucket, forcePathStyle, accessKeyId, secretAccessKey, region } = this.settings;
    return presignGetUrl(
      { endpoint: publicEndpoint, bucket, forcePathStyle },
      { accessKeyId, secretAccessKey, region },
      key,
      {
        signingDate: startOfUtcDay(),
        expiresIn: getUrlExpirySeconds,
        responseContentDisposition: options?.downloadName ? attachmentDisposition(options.downloadName) : undefined,
      },
    );
  }

  /** The content type is signed, so the browser must send it verbatim; the size is checked afterwards with `stat`. */
  async presignUpload(key: string, contentType: string): Promise<PresignedUpload> {
    const url = await getSignedUrl(
      this.publicClient,
      new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType }),
      { expiresIn: uploadUrlExpirySeconds, signableHeaders: new Set(["content-type"]) },
    );
    return { url, headers: { "Content-Type": contentType } };
  }

  async *listPrefix(prefix: string): AsyncIterable<ListedObject> {
    let continuationToken: string | undefined;
    do {
      const page = await this.client.send(
        new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix, ContinuationToken: continuationToken }),
      );
      for (const object of page.Contents ?? []) {
        if (object.Key) yield { key: object.Key, lastModified: object.LastModified ?? new Date(0) };
      }
      continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (continuationToken);
  }
}
