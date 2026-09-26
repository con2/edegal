import "dotenv/config";

import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

import { publicUrl, s3 } from "@/config";

/**
 * One-time bucket setup: the CORS rule that lets browsers PUT uploads straight to the bucket with a
 * presigned URL from the site's origin. Extra origins (a second hostname, a dev server) go as
 * arguments:
 *
 *   npm run s3:setup
 *   npm run s3:setup -- https://uusi.example.com http://localhost:3160
 */
if (!s3.bucket) throw new Error("S3_BUCKET is not set");

const origins = [publicUrl, ...process.argv.slice(2)];
const rules = [
  {
    AllowedOrigins: origins,
    AllowedMethods: ["PUT", "GET", "HEAD"],
    AllowedHeaders: ["*"],
    ExposeHeaders: ["ETag"],
    MaxAgeSeconds: 3600,
  },
];

const client = new S3Client({
  region: s3.region,
  endpoint: s3.endpoint,
  forcePathStyle: s3.forcePathStyle,
  credentials: {
    accessKeyId: s3.accessKeyId,
    secretAccessKey: s3.secretAccessKey,
  },
});
await client.send(
  new PutBucketCorsCommand({
    Bucket: s3.bucket,
    CORSConfiguration: { CORSRules: rules },
  }),
);
console.log(`CORS rules applied to bucket ${s3.bucket} at ${s3.endpoint}:`);
console.log(JSON.stringify(rules, null, 2));
