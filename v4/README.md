# v4

Rewrite of the conikuvat.fi / larppikuvat.fi gallery as a Next.js + Prisma 8 application.
See `../spec/rewrite.md` for the specification.

## Development

Requirements: Node 24, PostgreSQL 17 or newer (production runs 17).

```sh
createuser edegal --pwprompt          # password "photos" in the defaults
createdb -O edegal edegal
cp .env.example .env                  # defaults match the above
npm install
npm run legacy:schema                 # empty edegal_* tables so legacy code paths work (skip if the DB holds a production dump)
npm run db:migrate:dev                # apply v4 migrations
npm run db:seed                       # example content and media
npm run dev                           # http://localhost:3160
```

To browse real legacy content locally, restore a production dump into the database before
running the migrations and point `MEDIA_BASE_URL` at the production media host.

## Schema changes

1. Edit `src/prisma/contract.prisma`.
2. `npm run db:plan -- <snake_slug>` and review the generated `migrations/app/<ts>_<slug>/migration.ts`.
3. `npm run db:migrate:dev`.
4. Commit the contract, the emitted `contract.json`/`contract.d.ts`, the migration and `migrations/app/refs/db.json`.

Never use `prisma db update` here: it drops every table the contract does not describe, including the legacy Django tables.
