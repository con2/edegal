import { execFileSync } from "node:child_process";

/** Brings the test database to the current contract before the integration suite runs. */
export default function globalSetup() {
  const databaseUrl = process.env.TEST_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("TEST_DATABASE_URL must be set for integration tests");
  }
  const env = { ...process.env, DATABASE_URL: databaseUrl };
  execFileSync("npx", ["tsx", "src/legacy/apply-schema.ts"], {
    stdio: "inherit",
    env,
  });
  execFileSync(
    "npx",
    ["prisma", "db", "migrate", "--db", databaseUrl, "--quiet"],
    {
      stdio: "inherit",
      env,
    },
  );
}
