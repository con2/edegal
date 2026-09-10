FROM node:24 AS deps
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24 AS builder
WORKDIR /usr/src/app
ENV NEXT_TELEMETRY_DISABLED=1
ENV PRISMA_DISABLE_TELEMETRY=1
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY package.json package-lock.json next.config.ts tsconfig.json eslint.config.mjs prisma.config.ts ./
COPY src src
COPY migrations migrations
RUN npm run build

# Init container that applies migrations. Installs only the ORM engine packages (pinned in
# package.json) instead of the full `prisma` CLI, which pulls in ~1 GB of deployment tooling.
FROM node:24-slim AS migrator
WORKDIR /usr/src/app
ENV PRISMA_DISABLE_TELEMETRY=1
COPY package.json ./
RUN node -e ' \
  const p = require("./package.json"); \
  const keep = ["@prisma/cli-engine", "@prisma/orm-toolchain", "@prisma/orm-postgres", "dotenv"]; \
  const all = { ...p.dependencies, ...p.devDependencies }; \
  const dependencies = Object.fromEntries(keep.map((k) => [k, all[k]])); \
  require("fs").writeFileSync("package.json", JSON.stringify({ name: "v4-migrator", private: true, type: "module", dependencies })); \
  ' && npm install --no-audit --no-fund --ignore-scripts && npm cache clean --force
COPY prisma.config.ts ./
COPY src/prisma src/prisma
COPY src/bin/migrate.mjs src/bin/migrate.mjs
COPY migrations migrations
CMD ["node", "src/bin/migrate.mjs", "db", "migrate"]

FROM node:24-slim AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Do not set HOSTNAME: Next would build absolute request URLs with it, turning next-intl's
# locale rewrite into a cross-host rewrite that redirect-loops. Unset, the server binds 0.0.0.0.
ENV PORT=3000
COPY --from=builder /usr/src/app/.next/standalone ./
COPY --from=builder /usr/src/app/.next/static .next/static
CMD ["node", "server.js"]
