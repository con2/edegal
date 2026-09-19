# v4 (Edegal rewrite)

Next.js 16 App Router + Prisma 8 (prisma-next) + PostgreSQL. Lives alongside the legacy Django
backend (`../v2-backend`, admin only); shares its PostgreSQL database and `public` schema.

## Commands

- `npm run dev` – dev server on http://localhost:3160 (no automatic migrations; run `npm run db:migrate:dev` first)
- `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format`
- `npm test` (unit), `npm run test:integration` (needs `TEST_DATABASE_URL`)
- `npm run db:plan -- <slug>` – emit contract and plan a migration; `npm run db:migrate:dev` – apply and advance the `db` ref
- `npm run db:seed` – example v4 content into the dev database and `MEDIA_ROOT`
- `npm run legacy:schema` – create empty `edegal_*` tables in a fresh database (dev/test only)

## Prisma 8 is not Prisma 7

Read `node_modules/@prisma/orm-postgres/skills/prisma-8/SKILL.md` and its `references/` before
touching the contract, migrations or queries. Key points:

- Contract source: `src/prisma/contract.prisma`. After editing, `prisma contract emit` regenerates
  `contract.json` + `contract.d.ts` (committed, never hand-edited).
- Queries: `db.orm.public.<Model>` and `db.sql.public.<table>` from `src/prisma/db.ts`.
- Migrations are TypeScript packages under `migrations/app/`; `ops.json` is compiled by running the
  migration file, never edited by hand.
- Production applies migrations with `src/bin/migrate.mjs` (ORM command family only, built on the same
  engine as `prisma`) so the migrator image stays ~50 MB; local development uses the `prisma` CLI.
- **Never run `prisma db update` or `prisma db init` against a database that holds legacy tables.**
  `db update` reconciles the whole database to the contract and plans `DROP TABLE` for every table it
  does not know about, i.e. all `edegal_*` and Django tables. Use `migration plan` + `db migrate` only.
  `db verify` (without `--strict`) tolerates unmanaged tables and is safe.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Legacy content

Read-only access to the Django tables lives in `src/legacy/` as hand-written SQL on the `pg` driver
(same pool as Prisma). Nothing outside `src/legacy/` may name an `edegal_*` table.

## Conventions

- Translations: `src/translations/en.ts` defines the `Translations` type, `fi.ts` implements it.
  Components take narrow `messages` props typed as `Translations["Namespace"]`.
- Bootstrap + SCSS (no Tailwind).
- Locale is negotiated by next-intl (`src/proxy.ts`) without URL prefixes; pages live under
  `src/app/[locale]/`.
- Lowercase SQL keywords in hand-written SQL.
