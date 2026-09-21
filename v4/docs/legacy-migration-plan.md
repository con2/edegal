# Legacy (Django `edegal_*`) → v4 data migration plan

Numbers below come from the local `edegal` database, a **larppikuvat.fi** production dump
(790 albums, 45 361 pictures, 260 579 media rows, 26 photographers, 22 series, 13 terms rows).

## Phase 1 rehearsal findings (2026-09-21)

Rehearsed `--dry-run` and `--apply` against both a fresh larppikuvat.fi restore and a
**conikuvat.fi** production dump (`conikuvat-20260921.sql`; 4300 albums, 239 712 pictures,
1 197 940 media rows, 139 photographers, 3 series, 605 terms — conikuvat also already had a
handful of real v4 rows: production has v4 live there, so this doubled as the first real test of
enrich-not-replace against actual admin-created content, not just an empty v4 layer). Full cycle
each time: restore → apply Prisma migration → `legacy:verify` (before) → `legacy:migrate --apply`
→ re-`--apply` to check idempotency → `legacy:verify` with `LEGACY_ENABLED=false` (after) → diff.

Bugs the rehearsal found and fixed in `migrate-legacy.ts`:

- **`v4_album_credit` unique-constraint crash**: 15 conikuvat albums credit the same photographer
  as both `photographer_id` and `director_id`. Now merged into one credit row
  (`isCopyright: true`, `description: "director"`) instead of inserting the pair twice.
- **`v4_media` unique-constraint crash**: legacy media specs could render more than one size at
  the same role+format (multiple "preview"/"jpeg" widths for responsive `<img>`) — 209 604 of
  conikuvat's 1 197 940 media rows are such duplicates (0 in larppikuvat). v4's `Media` model has
  no size dimension, so only the largest variant of each (photo, role, format) survives.
- **Terms re-created on every run**: the idempotency match queried by the raw legacy text, but
  the row had been stored with hard breaks added (`\n` → `"  \n"`); a multi-line terms text never
  matched its own already-migrated row. Fixed by matching on the same transformed text that gets
  stored.
- **Duplicate photographer links**: enrich-if-new matched by exact `href`, so a v4 profile whose
  own link differed from the legacy handle only by a trailing slash (e.g. `nyymix.net` vs.
  `nyymix.net/`) got the "same" link added a second time. Now compared with the trailing slash
  stripped.
- **Sibling album ordering**: every migrated album defaulted to `ordering: 0`, so subalbums whose
  legacy dates tie (very common — a con's per-photographer subalbums all dated to one event day)
  sorted by incidental fetch order instead of a stable one. Migrated albums now get a strictly
  increasing `ordering` from their position in `exportAlbums()`'s `(level, lft)` order, so siblings
  keep a deterministic left-to-right order. Note: this does **not** reproduce legacy's own display
  order for tied dates — `legacySubalbums()`'s SQL (`order by date desc nulls last, a.tree_id`)
  ties on `tree_id` for direct siblings (they share one tree), so legacy's actual tiebreak is
  whatever order Postgres's query planner happens to return, not a meaningful signal to replicate.

Diffed 4441 conikuvat pages before/after; every remaining diff is one of:

- `takenAt` string format (legacy keeps the original UTC offset, e.g. `+03:00`; v4's
  `pgTimestampToIso` normalizes to `Z`) — same instant, cosmetic only, pre-existing between the
  two loaders and not something migration controls.
- `termsUrl` present before, `null` after, for albums whose own legacy terms row is blank
  (empty text and url) — intentionally not migrated as a meaningless placeholder row.
- `credits` differ for a handful of already-v4-native photographers (their own v4 links don't
  match legacy's freshly-rebuilt ones byte-for-byte) — expected, matches "enrich, don't replace."
- A migrated album with no photo that has a thumbnail (all its pictures skipped, or a bare index
  node) shows up in its parent's subalbum list after migration but didn't before: **v4's own
  subalbum listing has no such filter — it lists every child regardless of thumbnail — while
  legacy's `toSubalbum()` hides a child without one.** This is a pre-existing v4 behavior
  difference unrelated to migration, not something to fix here; flag it to the owner as a UX
  question if it matters (worth deciding before cutover, since it will make previously-hidden
  empty-looking tiles newly visible on affected event pages).
- Non-public pictures "missing" from their original album's photo list are not lost — they moved
  to the `-hidden` sibling album, exactly as designed.
- One legacy path collision (an album and a picture sharing one path) that 404'd under legacy
  now resolves cleanly to the album in v4 — an incidental improvement, not a regression.

No conikuvat-specific database, secret, or personal content is captured above beyond structural
counts; the actual dump and its restored throwaway database (`edegal_conikuvat`, local only) are
not part of the repo.

## Post-cutover finding: unoriented legacy previews (2026-09-21)

The Django pipeline rendered previews with PIL's `thumbnail()` and never applied the EXIF
orientation tag, so a camera portrait shot (landscape pixels, orientation 5–8) has sideways preview
and thumbnail files, and `edegal_media` recorded the original's stored-pixel dimensions. The
migration copied those rows verbatim with `byte_size = null`. v4 sizes the photo view and the
album grid from the rows, so such photos rendered stretched or sideways.

Fix: `npm run media:backfill` (`src/media/backfill.ts`, Job template
`chart/templates/job-media-backfill.yaml`) treats `byte_size is null` as "never inspected", fills
sizes and displayed dimensions from the files, and queues a media job for every tagged original.
`processMediaJob` now replaces a photo's scaled rows instead of adding missing ones, so the worker
repoints them at freshly rendered upright files under v4 keys. The legacy files stay in place.

## 0. Already in place

- **v4-wins path precedence** is implemented in `src/gallery/resolve.ts` (one `UNION ALL` probe
  over `[v4_photo, v4_album, v4_series, legacy_series, legacy_picture, legacy_album]`). A v4 album
  at a legacy path fully replaces the legacy page; legacy photos at that path never show. This is
  the only interim-coexistence merge we want — see decision on root-only subalbum merge below.
- Root-only subalbum merging (`withLegacyRootSubalbums`, `src/gallery/load.ts`), series member
  merge (`src/gallery/series.ts`), photographer index/page merge (`src/gallery/photographers.ts`),
  redirect walk (`src/gallery/redirects.ts`), `/random` (`src/app/[locale]/random/route.ts`), series
  slug suggestions (`src/editor/formData.ts`).
- `LEGACY_ENABLED` (`legacyEnabled` in `src/config.ts`, default true) already gates all of the
  above at 9 call sites. The chart hard-codes `LEGACY_ENABLED: "true"` in
  `chart/templates/configmap.yaml`.
- Isolation boundary: `src/legacy/isolation.test.ts` fails if any file outside `src/legacy/` names
  an `edegal_*` table. Typed accessors live in `src/legacy/sql.ts` → `rows.ts` → `provider.ts`; the
  gallery layer merges the resulting view models. This is where merge logic belongs and stays.
- Legacy HTML renders today via `legacyHtmlBody()` (`sanitize-html`) and `dangerouslySetInnerHTML`
  in `AlbumView.tsx`/`PhotographerProfile.tsx`. v4 bodies render through `@con2/components`
  `Markdown` (`react-markdown` + `rehype-sanitize` + `rehype-external-links`).

**Decision:** the root-only subalbum merge is _not_ generalized to other levels. Any other v4
album at a legacy path simply replaces that legacy album in the UI, as `resolve.ts` already does.

## 1. Schema mapping and enrich-not-replace rules

Match keys: albums/pictures by `path`, photographers by `slug`, series by `slug`, terms by exact
`(text, url)`, media by `storage_key`. "Enrich" = write a v4 field only when it is empty/null;
never overwrite a non-empty v4 value. All passes must be idempotent (re-running is a no-op).

### 1.1 `edegal_album` → `v4_album`

Straightforward path/slug/parent copy, `legacyVisibility()` mapping (`src/legacy/provider.ts`) on
create only, `redirect_url`/`layout`/`is_downloadable` fill-if-empty-or-create-only,
`terms_and_conditions_id` and `series_id` fill-if-null, photographer/director credits added as
`v4_album_credit` rows if the (album, photographer) pair is missing (`isCopyright` true for
photographer, false + `description="director"` for director, matching `toCredit()`).

Resolved field decisions:

- **`description`**: add `Album.description String @default("")` to the contract (Series already
  has it). `generateMetadata` uses it when present, falling back to the cover photo's copyright
  statement — today's behavior — when it's empty. Fill from legacy `description` if v4's is empty.
- **`body`**: HTML → Markdown (§2), fill if v4 `body.trim() === ""`. Convert as-is, including a
  leading `# Title` that duplicates the album title — v4 does not auto-render the title inside the
  body, authors occasionally put something else there, and stripping would guess wrong.
- **`eventDate`**: change the contract field from
  `eventDate DateString @default(dbgenerated("current_date")) @map("event_date")`
  (`src/prisma/contract.prisma:127`) to **nullable**, dropping the default. Migrate legacy `date`
  verbatim, including null (31 albums with no date, plus sort-hack dates like `2920-09-27` — keep
  those as-is). Update the subalbum ordering in `src/gallery/v4/provider.ts:128`
  (`.orderBy([(a) => a.ordering.asc(), (a) => a.eventDate.desc()])`) so albums with a null date sort
  last regardless of direction; check the Prisma-8 query builder's nulls-ordering support before
  assuming this needs raw SQL. Update the `@@index([parentId, ordering, eventDate])`
  (`contract.prisma:146`) and any other `eventDate`-typed call site (`series.ts`,
  `photographers.ts`, `editor/formData.ts`, `editor/schemas.ts`, `AlbumForm.tsx`,
  `importers/flickr.ts`) for the now-nullable type.
- **`thumbnailPhotoId`/`thumbnailIsAuto`**: fill if null with the mapped v4 photo for
  `cover_picture_id`, set **`thumbnailIsAuto = false`** — freeze today's appearance rather than
  letting the worker re-pick later.
- **`ownerId`**: leave **null**. No safe join exists from Django `created_by`/`auth_user.username`
  to `v4_user.sub` (a Kompassi numeric id). Legacy albums stay admin-editable until an admin
  manually assigns an owner via the edit form (`formData.ownerId`) — no automated linking.

Special path: legacy `/photographers` (id 437, hidden, holds the Larppikuvaajat intro) is created
directly as a v4 album; `loadPhotographersIndex` must read the intro from the **v4** album at
`/photographers` first, legacy second (today it calls `legacyAlbumByPath("/photographers")`
unconditionally).

### 1.2 `edegal_picture` → `v4_photo`, and hidden/private pictures

Copy `path`/`slug`/`title`/`ordering` (legacy `"order"` has the same ascending semantics)/`takenAt`
into a v4 photo under the v4 album at the same path, created in 1.1. Skip (and log) any legacy
picture whose path already holds a v4 photo or album.

**Resolved: no `Photo.visibility` column in v4.** Legacy `is_public = false` pictures (2 in this
dump) are not migrated in place. Instead, for each legacy album that contains one or more
non-public pictures, the migration creates a **sibling v4 album** (same parent, slug
`<slug>-hidden`, title `<Title> (hidden)`, `visibility = "hidden"`) if one doesn't already exist,
and migrates those specific pictures into the sibling instead of the original album. This means a
previously-non-public picture's v4 path becomes `<albumPath>-hidden/<slug>` rather than
`<albumPath>/<slug>` — acceptable since these were never public URLs. Note during rehearsal
whether any admin-facing links depended on the old path.

`mediaKeyBase` is set explicitly to the photo's original `path` so storage keys don't move; a
same-filename re-upload through v4 will then delete and overwrite the legacy media files for that
photo (`clearPhotoMedia`, `src/media/addPhoto.ts`) — acceptable, but would leave the Django admin
showing broken media for that one picture.

### 1.3 `edegal_media` → `v4_media`

Copy `storageKey`/`role`/`format`/`width`/`height` verbatim; skip if the storage key already
exists. Leave `byteSize` null (legacy never recorded it; stat-ing 260k NFS files isn't worth it).
Pictures with an original but no thumbnail (~7 in this dump) get a `v4_media_job` row so the
existing worker renders one; pictures with neither original nor thumbnail are skipped and logged.

### 1.4 `edegal_series` → `v4_series`

Match by slug; create if absent with the same visibility/description/body fill-if-empty rules as
albums. An existing v4 series (already reachable today via slug-based "continue this series")
keeps its own title/visibility.

### 1.5 `edegal_termsandconditions` → `v4_terms`

Match by exact `(text, url)`. If absent, create with `title` derived from the first line (or the
CC license name when recognizable), `text` = legacy text with single newlines converted to
Markdown hard breaks (`"  \n"`) to preserve current line-break rendering, `ownerId` null.
`is_public` has no v4 equivalent and is dropped. `default_terms_and_conditions_id` →
`defaultTermsId` fill-if-null.

### 1.6 `edegal_photographer` → `v4_photographer` (+ `v4_photographer_link`)

Match by slug; create if absent. `displayName`/`email` fill-if-empty, `body` → `introduction` via
HTML→Markdown fill-if-empty, `coverPhotoId`/`defaultTermsId` fill-if-null.

Social links: reuse the exact `socialLinks` builder in `src/legacy/provider.ts`, add a link only
if no v4 link with the same `href` already exists. The handle columns contain some full URLs and
some plain display names instead of handles — normalize (`href` verbatim if it contains `://`) and
skip-and-log anything containing a space rather than building a broken URL.

**Resolved: `userId` stays null, manual admin linking only** (no email-based matching). This means
`ensurePhotographer()` (`src/editor/photographers.ts`) will create a second, duplicate photographer
profile the first time a legacy photographer signs in, until an admin manually links their account
to the migrated profile. Document this as an operational step for the cutover window.

**Resolved: the larppikuvat photographer-profile Q&A** (`larppikuvat_larppikuvatphotographerprofile`,
1 row) **is not migrated.** It was never rolled out widely; no tooling needed.

### 1.7 Not migrated

`edegal_importjob`/`importitem`, `edegal_mediaspec`, `django_*`, `auth_*`, `larppikuvat_*`. No
`v4_redirect` entries are needed since every path is preserved as-is.

## 2. HTML → Markdown

Sampled all 233 album bodies, 9 photographer bodies, and 19 series bodies from the larppikuvat
dump. Tag set is exactly `{p, strong, em, a, h1-h4, ul, ol, li, br, hr, img}`; no tables, no inline
styles, no scripts. Two eras: older CKEditor rows with HTML entities and `<p>&nbsp;</p>` spacers,
newer django-prose-editor rows that are clean. 189/233 bodies open with `<h1>` (see the "keep the
duplicate title" decision above); 4 contain a banner `<img width="100%">`.

**Decision (already reflected in §1.1): convert once at migration time to Markdown, no per-model
HTML/Markdown switch.** The content is fully within CommonMark's range; the only losses are
`target="_blank"` (re-added at render time by `rehype-external-links` anyway) and the `width="100%"`
attribute on 4 images (handle with a CSS `max-width: 100%` rule on body images, or accept as-is).
A switch would keep `sanitize-html`/`dangerouslySetInnerHTML`/`body.kind` branching alive forever,
which phase 4 removes, and would make those bodies uneditable in the v4 editor.

Implementation: `unified` pipeline — `rehype-parse` → `rehype-remark` → `remark-stringify` — in a
new `src/legacy/html.ts` (`legacyHtmlToMarkdown(html): string`), ATX headings, `-` bullets, `*`
emphasis, hard breaks for `<br>`. Add `rehype-remark` (and direct pins of the others already
present transitively) as a **production** dependency, since the migration Job runs in the worker
image (`npm prune --omit=dev`'d). Unit-test with ~10 verbatim fixtures pulled from the dump
(entity-heavy row, `<img>` banner row, compact prose-editor row, nested list, `<p>&nbsp;</p>`
spacer). Post-process: collapse blank-line runs, trim, drop empty paragraphs.

**Manual review gate:** dry run prints every converted body's HTML/Markdown side by side to a
report file for a skim before `--apply`.

## 3. Migration mechanics

### 3.1 Why not a Prisma migration

Prisma 8 `db migrate` runs the compiled SQL in `ops.json`; the migrator image deliberately carries
no app code, `sharp`, or the HTML-conversion pipeline. The **data migration is a standalone `tsx`
script**; Prisma migrations are used only for the contract change it depends on (`Album.description`,
`Album.eventDate` nullability). That contract migration ships first through the normal path
(`npm run db:plan -- album_description_and_nullable_date`, review, `npm run db:migrate:dev`,
commit) before the data migration runs. `ops.json` is never hand-edited.

### 3.2 The script

`src/bin/migrate-legacy.ts`, following the pattern of `src/bin/seed.ts` (`import "dotenv/config"`,
`db` from `@/prisma/db`, closes the pool on exit). All legacy-table SQL for the migration (bulk
selects of albums-with-level, pictures, media, photographers, series, terms) lives in a new
`src/legacy/export.ts` so `isolation.test.ts` keeps passing; the script itself imports only from
`@/legacy/*` and `@/prisma/db`.

Idempotent passes, in order: terms → photographers (+ links) → series → albums by legacy `level`
ascending (root first) → credits/thumbnail/series/terms links → hidden-picture sibling albums →
pictures + media (+ `v4_media_job` rows for missing thumbnails) → photographer cover photos →
`touchSubtree("/")` and `touchSeries` for every migrated series, so the per-process album cache
(`src/gallery/cache.ts`) invalidates without a restart.

Flags: `--dry-run` (default; writes nothing, emits the plan and the HTML→Markdown report),
`--apply`, `--only=<pass>`, `--report=<file>`. Transact per album subtree or per pass, not one
transaction over ~300k rows; batch media inserts in chunks of ~1000. Print a summary of
created/skipped counts per entity and every skip reason.

### 3.3 Verification

`src/bin/verify-legacy-migration.ts` walks every legacy album/picture path and photographer/series
slug through the real page loaders (`loadGalleryPage`, `loadPhotographerPageBySlug`,
`loadSeriesPageBySlug`) and dumps a normalized JSON of the resulting view model (dropping
`id`/`parentId`/`legacyAdminUrl`/`ownerId`, keeping title/date/visibility/breadcrumb/children/
photos/credits/terms/redirects). Since `legacyEnabled` is read once from env, run it twice —
`LEGACY_ENABLED=true` before, `LEGACY_ENABLED=false` after `--apply` — and diff the two dumps.
Expected diffs are enumerable: body text (HTML vs. Markdown), credit `links` after handle
normalization, and the hidden-picture sibling albums. Add an integration test alongside
`src/gallery/load.integration.test.ts` seeding legacy fixtures via SQL and asserting the
enrich-not-replace rules and pass idempotency.

### 3.4 Local rehearsal against production dumps

1. Restore a prod `pg_dump` (both sites in turn) into a fresh local database; `npm run
db:migrate:dev` to apply the contract migration.
2. `verify-legacy-migration` with `LEGACY_ENABLED=true` → `before.json`.
3. `migrate-legacy` dry run, read the HTML report, then `migrate-legacy --apply`.
4. `verify-legacy-migration` with `LEGACY_ENABLED=false` → `after.json`; diff against `before.json`.
   Browse locally with `LEGACY_ENABLED=false`.
5. Re-run `--apply` and confirm no further changes (idempotency check).

### 3.5 Kubernetes Job

`chart/templates/job-legacy-migration.yaml`, guarded by `{{ if .Values.legacyMigration.enabled }}`
(default `false`, so ordinary `helm upgrade` never renders it). Uses the worker image (has `tsx`
and prod deps; the small migrator image does not), same `securityContext`/NFS mount as
`deployment-worker.yaml`, `backoffLimit: 0`, a `ttlSecondsAfterFinished`. Run by hand, once per
site, dry-run first:

```
helm template v4 chart -f chart/values-larppikuvat.yaml --set image.tag=<sha> \
  --set legacyMigration.enabled=true --set legacyMigration.runId=$(date +%s) \
  -s templates/job-legacy-migration.yaml | kubectl -n larppikuvat-v4 apply -f -
kubectl -n larppikuvat-v4 logs -f job/legacy-migration-<runId>
```

Take a `pg_dump` immediately before `--apply` runs in prod. Document the exact commands in
`chart/README.md` next to the existing runbook entries.

## 4. Phased plan

**Phase 0 — Preparation** (deployable any time, no behavior change): contract migration
(`Album.description`, nullable `eventDate`); `loadPhotographersIndex` reading the v4
`/photographers` album first; `src/legacy/html.ts` + tests; `src/legacy/export.ts`;
`migrate-legacy.ts`; `verify-legacy-migration.ts`; the Job template; `rehype-remark` etc. as prod
deps.

**Phase 1 — Rehearsal** against both sites' dumps per §3.4, iterating until the diff is only the
expected set.

**Phase 2 — Production migration**, per site, `LEGACY_ENABLED` still true: backup → Job dry-run →
Job apply → spot-check via a fresh post-migration dump run through `verify-legacy-migration` →
`kubectl rollout restart deployment/node` for cache safety. The site keeps working throughout,
since v4 rows already take priority over legacy at every merge point.

**Phase 3 — Cutover**: set `legacy.enabled: false` in `values-*.yaml` per site. Verify by re-running
the `verify-legacy-migration` diff (flag on vs. off — should be empty besides the hidden-picture
sibling albums), plus manual checks of `/photographers`, a legacy series, an internal
`redirect_url` album, an external Flickr redirect, a hidden/private album as staff, and an album
download. Announce a content freeze on the Django admin from phase 2 onward — anything edited
there after migration is silently ignored by the site. Soak for a couple of weeks; Django admin
stays reachable for reference.

**Phase 4 — Code cleanup**: delete `src/legacy/`, `legacy-schema/`, `apply-schema.ts`, the
`legacy:schema` script and its call in test setup, `legacyEnabled`/`legacyAdminUrl` from config and
chart, the `source`/`"legacy"` branches across `access.ts`/`resolve.ts`/`load.ts`/`series.ts`/
`photographers.ts`/`redirects.ts`/`random/route.ts`/`formData.ts`, the `body.kind`/`terms.kind`
HTML union and `dangerouslySetInnerHTML` paths, `sanitize-html`, the migration/verify scripts and
Job template, legacy fixtures in integration tests, `isolation.test.ts`, and the "Legacy content"
sections of CLAUDE.md/README. Keep the `/admin` proxy route.

**Phase 5 — Decommission v2**: remove `legacy.*` chart values and their HTTPRoute rules; delete the
v2-backend K8s resources per site; delete `.github/workflows/v2-backend.yaml` and `v2-backend/`
(move `seed.ts`'s sample images out of it first); move `v4/*` to the repo root and update the CI
workflow, chart paths, and `docker-bake.hcl` accordingly.

**Phase 6 — Drop legacy tables**: after a final off-cluster `pg_dump` of the `edegal_*`/`auth_*`/
`django_*`/`larppikuvat_*` tables, drop them **by hand via `psql`, per site** — not through a
Prisma migration, since these tables are not, and have never been, managed by Prisma. Document the
exact commands in the runbook. Afterward `prisma db verify --strict` should pass, and the
`db update`/`db init` warning in CLAUDE.md can be relaxed.

## 5. Remaining risks

1. Conikuvat.fi content is unverified against every claim above (tag set, sizes, private-picture
   count, handle quality) — re-sample before running there.
2. Content freeze from phase 2 onward: communicate to anyone still using the Django admin.
3. Duplicate photographer profiles are expected on first login until an admin manually links the
   account — needs a documented operational step, not just code.
4. Nulls-last ordering for `eventDate` needs verifying against the Prisma 8 query builder's actual
   support (§1.1); may need a raw-SQL order clause if the builder can't express it.
5. Hidden-picture sibling albums change those pictures' v4 paths; check during rehearsal whether
   any admin tooling assumed the old path.
