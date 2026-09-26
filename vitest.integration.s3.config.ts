import "dotenv/config";
import os from "node:os";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * The S3-backed integration suite (`src/** /*.s3.test.ts`, without the space). Points the app at a
 * bucket meant for tests through the TEST_S3_* variables so a developer's own S3_* settings are
 * never touched: `scripts/garage-init.sh` prints them for the local Garage.
 */
if (!process.env.TEST_S3_BUCKET) {
  throw new Error(
    'TEST_S3_BUCKET (and TEST_S3_ENDPOINT, TEST_S3_ACCESS_KEY_ID, TEST_S3_SECRET_ACCESS_KEY) must be set for the S3 integration tests; see README.md, "Media in Garage"',
  );
}

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.s3.test.ts"],
    globalSetup: "./src/test/globalSetup.ts",
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL!,
      MEDIA_ROOT: path.join(os.tmpdir(), "v4-test-media-s3"),
      S3_ENDPOINT: process.env.TEST_S3_ENDPOINT!,
      S3_PUBLIC_ENDPOINT:
        process.env.TEST_S3_PUBLIC_ENDPOINT ?? process.env.TEST_S3_ENDPOINT!,
      S3_REGION: process.env.TEST_S3_REGION ?? "garage",
      S3_BUCKET: process.env.TEST_S3_BUCKET,
      S3_FORCE_PATH_STYLE: process.env.TEST_S3_FORCE_PATH_STYLE ?? "true",
      S3_ACCESS_KEY_ID: process.env.TEST_S3_ACCESS_KEY_ID!,
      S3_SECRET_ACCESS_KEY: process.env.TEST_S3_SECRET_ACCESS_KEY!,
    },
    fileParallelism: false,
  },
});
