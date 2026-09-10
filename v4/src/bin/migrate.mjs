/**
 * Applies migrations without the full `prisma` CLI, whose dependency tree (cloud deployment
 * tooling) is ~1 GB. Mounts only the ORM command family from the toolchain that the runtime
 * already depends on. Used by the migrator image; local development keeps using `prisma`.
 *
 * Built on the same engine API `prisma` itself uses (createCli + a runtime object); both are
 * release-candidate internals, so re-check this file when bumping Prisma.
 */
import process from "node:process";
import { createCli, loadConfig } from "@prisma/cli-engine";
import { ormCommandFamily } from "@prisma/orm-toolchain/cli";

const commands = [
  "db migrate",
  "db verify",
  "migration check",
  "migration status",
];

const cli = createCli({
  name: "prisma",
  version: "orm-only",
  commandFamilies: [ormCommandFamily],
  groups: {
    db: { brief: "Verify and migrate the database against the contract" },
    migration: { brief: "Inspect on-disk migrations" },
  },
  commands: Object.fromEntries(
    commands.map((c) => [c, ormCommandFamily.commands[c]]),
  ),
  help: {
    tagline: "Prisma ORM migrations",
    description: "",
    examples: ["db migrate"],
    docsUrl: "https://www.prisma.io/docs",
  },
});

const runtime = {
  stdout: { write: (text) => process.stdout.write(text) },
  stderr: {
    write: (text) => process.stderr.write(text),
    get columns() {
      return process.stderr.columns;
    },
  },
  stdin: {
    [Symbol.asyncIterator]: () => process.stdin[Symbol.asyncIterator](),
  },
  cwd: process.cwd(),
  env: process.env,
  isTty: {
    stdin: false,
    stdout: process.stdout.isTTY === true,
    stderr: process.stderr.isTTY === true,
  },
  outputStreamsShareDevice: false,
  exit: (code) => process.exit(code),
  onSignal: () => () => {},
  loadConfig: (configPath) => loadConfig(process.cwd(), configPath, "orm-only"),
  spawnTelemetry: () => {},
  openUrl: async () => {},
  host: { platform: process.platform, nodeVersion: process.version },
};

process.exitCode = await cli.run(process.argv.slice(2), runtime);
