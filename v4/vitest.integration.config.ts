import "dotenv/config";
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
    env: { DATABASE_URL: process.env.TEST_DATABASE_URL! },
    fileParallelism: false,
  },
});
