import type { NextConfig } from "next";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  output: "standalone",
  // The parent repo has its own lockfile; keep the workspace root here so standalone output is flat.
  turbopack: { root: path.resolve(import.meta.dirname) },
  reactCompiler: true,
  transpilePackages: ["@con2/components"],
  sassOptions: {
    // bootstrap still uses the legacy @import API
    silenceDeprecations: [
      "legacy-js-api",
      "import",
      "global-builtin",
      "color-functions",
      "if-function",
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
