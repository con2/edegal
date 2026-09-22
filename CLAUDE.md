# Conikuvat.fi / Larppikuvat.fi photo gallery v4 ("Edegal")

Photo gallery behind conikuvat.fi and larppikuvat.fi: Next.js 16 App Router + Prisma 8
(prisma-next) + Auth.js v5, living at the repo root. The previous Django backend (`v2-backend/`,
kept only for its admin at `/admin`) has been decommissioned now that the remaining editing
features are in v4; it lives in git history, and `docs/legacy-migration-plan.md` records how its
content was migrated.

Deployment: `chart/` (Helm, Gateway API, per-site values files); workflow `.github/workflows/v4.yaml`.
The media directory is NFS in production, owned by uid 1082. Media access moves to self-hosted S3
in con2/edegal#245; do not start that unprompted.

## Name of the application

The app used to be called "Edegal", but we're phasing the name out. No new name has been decided,
and it's okay to refer to the app internally by Edegal, but let's not prominently display it to
the user in new places.

## Working style

- Commit directly on `main` with a descriptive message; the owner pushes and watches CI.
- Never run anything against the production database from here. Locally, `edegal` holds a
  production dump plus the v4 tables and `edegal_test` is the integration-test database.

## Commands

- `npm run dev` – dev server on http://localhost:3160 (no automatic migrations; run `npm run db:migrate:dev` first)
- `npm run worker` – media worker; uploads become visible only when it runs
- `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format`, `npm run format:check`
- `npm test` (unit), `npm run test:integration` (needs `TEST_DATABASE_URL`)
- `npm run db:plan -- <slug>` – emit contract and plan a migration; `npm run db:migrate:dev` – apply and advance the `db` ref
- `npm run db:seed` – example v4 content into the dev database and `MEDIA_ROOT`

## Prisma 8 is not Prisma 7

Read `node_modules/@prisma/orm-postgres/skills/prisma-8/SKILL.md` and its `references/` before
touching the contract, migrations or queries. Key points:

- Contract source: `src/prisma/contract.prisma`. After editing, `prisma contract emit` regenerates
  `contract.json` + `contract.d.ts` (committed, never hand-edited).
- Queries: `db.orm.public.<Model>` and `db.sql.public.<table>` from `src/prisma/db.ts`.
- Migrations are TypeScript packages under `migrations/app/`; `ops.json` is compiled by running the
  migration file, never edited by hand.
- Production applies migrations with `src/bin/migrate.mjs` (ORM command family only) so the
  migrator image stays small; local development uses the `prisma` CLI.
- **Never run `prisma db update` or `prisma db init` against a database that holds legacy tables.**
  `db update` reconciles the whole database to the contract and plans `DROP TABLE` for every table it
  does not know about, i.e. all `edegal_*` and Django tables. Use `migration plan` + `db migrate` only.
  `db verify` (without `--strict`) tolerates unmanaged tables and is safe.
- Prisma only appends native enum values: add new values at the end of the enum. Removing a value
  needs a hand-authored migration (`npx prisma migration new`); see `migrations/app/*drop_heif*`.
- Production PostgreSQL is 17: ids use `@default(uuid(7))` generated at runtime, not `uuidv7()`.
- `pg` and `@types/pg` stay pinned to the versions the Prisma runtime bundles.

## Legacy content

v4 no longer reads the Django tables: all site content was migrated into `v4_*` tables, and
`LEGACY_ENABLED` and the legacy data-merge code are gone. The `edegal_*`/`auth_*`/`django_*`/
`larppikuvat_*` tables and their media files are still in the shared database and NFS mount
(dropping the tables is Phase 6 of `docs/legacy-migration-plan.md`); nothing in this repo touches
them anymore. Leave existing legacy thumbnails and media files alone.

## Auth

Auth.js v5 (`next-auth` 5 beta) with JWT sessions and no adapter, Kompassi OIDC provider discovered
from `issuer`. Session cookies are derived flags only; Kompassi users may belong to hundreds of
groups. Auth.js's optional nodemailer peer is `^7 || ^8`, so nodemailer 9 bumps must be closed.
`@con2/components` v5.x is the matching release of the shared component library.

## Media rules

- Originals are stored byte for byte in their own format (JPEG, PNG, WebP or AVIF); never re-encode
  or rotate them. Previews and thumbnails are generated as JPEG + AVIF; HEIC is refused.
- Photos sort by EXIF capture time; photos without it sort last on purpose (no mtime fallback).
  Filename numbers only via the explicit sort action.
- Never derive a photographer's name or slug from an email address.

## Conventions

- Translations: `src/translations/en.ts` defines the `Translations` type, `fi.ts` implements it.
  Components take narrow `messages` props typed as `Translations["Namespace"]`. In Finnish, upload
  is lähettää/lähetä; ladata/lataa means download.
- Bootstrap + SCSS (no Tailwind). Constants in lowerCamelCase.
- Locale is negotiated by next-intl (`src/proxy.ts`) without URL prefixes; pages live under
  `src/app/[locale]/`.
- Lowercase SQL keywords in hand-written SQL.
- Containers must not set the `HOSTNAME` env var: with next-intl's prefixless routing every page
  redirect-loops. The server binds 0.0.0.0 without it.

## Next.js

Next 16 differs from older releases in APIs, conventions and file layout. Read the relevant guide in
`node_modules/next/dist/docs/` before writing Next code.

@AGENTS.md
