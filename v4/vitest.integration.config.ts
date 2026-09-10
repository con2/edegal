import "dotenv/config";
import os from "node:os";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    globalSetup: "./src/test/globalSetup.ts",
    // Integration tests run against the test database only.
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL!,
      // Integration tests write media into a scratch directory, never the developer's media root.
      MEDIA_ROOT: path.join(os.tmpdir(), "v4-test-media"),
    },
    fileParallelism: false,
  },
});
