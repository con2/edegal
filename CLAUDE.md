# Conikuvat.fi / Larppikuvat.fi photo gallery v4 ("Edegal")

Photo gallery behind conikuvat.fi and larppikuvat.fi. Two applications share one PostgreSQL
database (`public` schema) and one media directory (NFS in production, owned by uid 1082):

- `v4/` – the site: Next.js 16 App Router + Prisma 8 (prisma-next) + Auth.js v5. Serves everything
  at the site root. Development happens here.
- `v2-backend/` – the previous Django backend, kept only for its admin at `/admin` (uv project,
  Python 3.14, Django 6). No feature work; it goes away once the remaining editing features are in v4.

Deployment: `v4/chart/` (Helm, Gateway API, per-site values files) and `v2-backend/kubernetes/`
(emskaffolden); workflows `.github/workflows/v4.yaml` and `v2-backend.yaml`. Media access moves to
self-hosted S3 in con2/edegal#245; do not start that unprompted.

## Name of the application

The app used to be called "Edegal", but we're phasing the name out. No new name has been decided,
and it's okay to refer to the app internally by Edegal, but let's not prominently display it to
the user in new places.

## Working style

- Commit directly on `main` with a descriptive message; the owner pushes and watches CI.
- Never run anything against the production database from here. Locally, `edegal` holds a
  production dump plus the v4 tables and `edegal_test` is the integration-test database.

## v4 commands (run in `v4/`)

- `npm run dev` – dev server on http://localhost:3160 (no automatic migrations; run `npm run db:migrate:dev` first)
- `npm run worker` – media worker; uploads become visible only when it runs
- `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format`, `npm run format:check`
- `npm test` (unit), `npm run test:integration` (needs `TEST_DATABASE_URL`)
- `npm run db:plan -- <slug>` – emit contract and plan a migration; `npm run db:migrate:dev` – apply and advance the `db` ref
- `npm run db:seed` – example v4 content into the dev database and `MEDIA_ROOT`
- `npm run legacy:schema` – create empty `edegal_*` tables in a fresh database (dev/test only)

## Prisma 8 is not Prisma 7

Read `v4/node_modules/@prisma/orm-postgres/skills/prisma-8/SKILL.md` and its `references/` before
touching the contract, migrations or queries. Key points:

- Contract source: `v4/src/prisma/contract.prisma`. After editing, `prisma contract emit` regenerates
  `contract.json` + `contract.d.ts` (committed, never hand-edited).
- Queries: `db.orm.public.<Model>` and `db.sql.public.<table>` from `v4/src/prisma/db.ts`.
- Migrations are TypeScript packages under `v4/migrations/app/`; `ops.json` is compiled by running the
  migration file, never edited by hand.
- Production applies migrations with `v4/src/bin/migrate.mjs` (ORM command family only) so the
  migrator image stays small; local development uses the `prisma` CLI.
- **Never run `prisma db update` or `prisma db init` against a database that holds legacy tables.**
  `db update` reconciles the whole database to the contract and plans `DROP TABLE` for every table it
  does not know about, i.e. all `edegal_*` and Django tables. Use `migration plan` + `db migrate` only.
  `db verify` (without `--strict`) tolerates unmanaged tables and is safe.
- Prisma only appends native enum values: add new values at the end of the enum. Removing a value
  needs a hand-authored migration (`npx prisma migration new`); see `v4/migrations/app/*drop_heif*`.
- Production PostgreSQL is 17: ids use `@default(uuid(7))` generated at runtime, not `uuidv7()`.
- `pg` and `@types/pg` stay pinned to the versions the Prisma runtime bundles.

## Legacy content

Read-only access to the Django tables lives in `v4/src/legacy/` as hand-written SQL on the `pg`
driver (same pool as Prisma). Nothing outside `v4/src/legacy/` may name an `edegal_*` table, and the
legacy tables are deliberately not in the Prisma contract. Legacy media specs (thumbnail and preview
formats and sizes in the Django admin) are not touched; existing legacy thumbnails stay as they are.

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

- Translations: `v4/src/translations/en.ts` defines the `Translations` type, `fi.ts` implements it.
  Components take narrow `messages` props typed as `Translations["Namespace"]`. In Finnish, upload
  is lähettää/lähetä; ladata/lataa means download.
- Bootstrap + SCSS (no Tailwind). Constants in lowerCamelCase.
- Locale is negotiated by next-intl (`v4/src/proxy.ts`) without URL prefixes; pages live under
  `v4/src/app/[locale]/`.
- Lowercase SQL keywords in hand-written SQL.
- Containers must not set the `HOSTNAME` env var: with next-intl's prefixless routing every page
  redirect-loops. The server binds 0.0.0.0 without it.

## Next.js

Next 16 differs from older releases in APIs, conventions and file layout. Read the relevant guide in
`v4/node_modules/next/dist/docs/` before writing Next code. `next dev` writes a note about this
under `v4/` (an `AGENTS.md` or a marked block); commit it with your work instead of deleting it.
