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

# Runs `prisma db migrate` as an init container; keeps the CLI and migration packages, nothing else.
FROM node:24 AS migrator
WORKDIR /usr/src/app
ENV PRISMA_DISABLE_TELEMETRY=1
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY package.json prisma.config.ts ./
COPY src/prisma src/prisma
COPY migrations migrations
CMD ["npx", "prisma", "db", "migrate"]

FROM node:24 AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Do not set HOSTNAME: Next would build absolute request URLs with it, turning next-intl's
# locale rewrite into a cross-host rewrite that redirect-loops. Unset, the server binds 0.0.0.0.
ENV PORT=3000
COPY --from=builder /usr/src/app/.next/standalone ./
COPY --from=builder /usr/src/app/.next/static .next/static
CMD ["node", "server.js"]
