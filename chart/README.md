# v4 Helm chart

Deploys the v4 gallery: a Next.js Deployment (with a Prisma migration init container), the media
worker DaemonSet, an nginx Deployment serving `/media` from the shared NFS export (until the
media has moved to S3, see "Media in S3 (Garage)"), a per-namespace Gateway with HTTPRoutes, and a
cert-manager Certificate.

## Prerequisites per namespace (`conikuvat-v4`, `larppikuvat-v4`)

```sh
kubectl create namespace conikuvat-v4
kubectl -n conikuvat-v4 create secret generic v4 \
  --from-literal=DATABASE_URL='postgresql://conikuvat:...@siilo.tracon.fi/conikuvat?sslmode=verify-full' \
  --from-literal=AUTH_SECRET="$(openssl rand -base64 32)" \
  --from-literal=KOMPASSI_OIDC_CLIENT_ID=... \
  --from-literal=KOMPASSI_OIDC_CLIENT_SECRET=...
```

The Kompassi OIDC client must allow the redirect URI `https://<hostname>/api/auth/callback/kompassi`.
All four keys are mandatory: the server refuses to start without them rather than falling back
to development defaults. `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` join them once `s3.bucket`
is set (see "Media in S3 (Garage)").

`sslmode=verify-full` (not `require`) since siilo.tracon.fi has a proper TLS certificate: `pg`
only warns on `require`/`prefer`/`verify-ca` today because it treats them as aliases for
`verify-full`, but a future major version will make them mean actual libpq semantics (weaker,
no hostname verification) instead - spelling out `verify-full` keeps today's behavior
unambiguous regardless of that future change.

**Never run `prisma db update` or `db init` against these databases.** They share the schema
with the legacy Django tables, and `db update` plans `DROP TABLE` for every table the contract
does not know about. The migration init container only ever runs `migration check` and
`db migrate`.

## Mail

`mail.*` feeds the contact form: `smtpHostname`, `smtpPort`, `sender` (envelope sender) and `from`
(the From header). Both production values files point at the same relay the legacy stack uses,
`sr1.pahaip.fi:25`, which needs no credentials. A relay that does gets `SMTP_USERNAME` and
`SMTP_PASSWORD` added to the Secret; the containers load every key of it. With an empty hostname the
form tells visitors that sending is unavailable.

## Media in S3 (Garage)

New uploads go to an S3 bucket on the cluster's own Garage (`infrastructure/kubernetes/garage.README.md`):
browsers PUT originals straight to the bucket with presigned URLs and fetch every image through
presigned URLs, so nothing in the bucket is public. One bucket and key per site, created from a
Garage pod:

```sh
kubectl -n garage exec garage-0 -- /garage bucket create conikuvat
kubectl -n garage exec garage-0 -- /garage key create conikuvat        # prints key ID and secret
kubectl -n garage exec garage-0 -- /garage bucket allow --read --write --owner conikuvat --key conikuvat
```

Add the key to the site's out-of-band `v4` Secret as `S3_ACCESS_KEY_ID` and
`S3_SECRET_ACCESS_KEY`, then set the stage 1 values:

```yaml
s3:
  endpoint: http://garage.garage.svc.cluster.local:3900 # in-cluster, plain HTTP
  publicEndpoint: https://garage.con2.fi # what browsers reach
  region: garage
  bucket: conikuvat
  forcePathStyle: true
```

Once per bucket, allow browser uploads from the site's origin (CORS) by running `npm run s3:setup`
with the same `S3_*` settings and `AUTH_URL=https://<hostname>` in the environment, for example
from a shell in a `node` pod, or locally against `https://garage.con2.fi` as the endpoint.

With the bucket set, new originals and every regenerated preview land in S3 while rows still on
the export keep being served from it; `mediaNfs` and `nginx` stay enabled until the migration
below has run.

## Migrating media to S3

`src/bin/migrate-media-to-s3.ts` copies every original still on the export to its canonical key
in the bucket, repoints the row and queues a media job so the worker renders fresh previews into
S3; legacy files are never changed or deleted. It runs through `mediaTask` with the export mounted
read-only:

1. Values: `mediaTask: { enabled: true, runId: 1, script: src/bin/migrate-media-to-s3.ts, args: [], nfs: true }`;
   push. Read the tally at the end of `kubectl -n <ns> logs job/media-task-1`.
2. Values: `runId: 2`, `args: ["--apply"]`; push. Watch the worker drain the queue:
   `select status, count(*) from v4_media_job group by 1`. Rerunning is safe: an original already
   in the bucket with the same size is skipped.
3. Verify `select backend, count(*) from v4_media group by 1` shows no `fs`, and spot-check album
   pages.
4. Values: `mediaNfs.enabled: false`, `nginx.enabled: false`, `mediaTask.enabled: false`; delete
   `mediaNfs.server`/`mediaNfs.path` from the site values file; push. `/media/<key>` now reaches
   the app, which authorizes the request and redirects to a presigned URL.

## Resources

`resources.*` in values sets requests and limits per container. The defaults were sized from
production usage with headroom for one 100 MB upload decoding at up to 100 megapixels in the web
process, and `workerConcurrency` such decodes in the worker. nginx memory is mostly reclaimable
page cache from the NFS export.

## Worker

The `worker` DaemonSet (image tag `<sha>-worker`) generates previews for uploaded photos. It shares
the ConfigMap, Secret and NFS mount with the web Deployment. Each node runs one worker process with
`workerConcurrency` conversions; a node that is down means one worker fewer rather than two on
another node competing for its cores. Any number of workers is safe: jobs are claimed with
`SKIP LOCKED`, a job whose process died is requeued after 15 minutes (and failed once out of
attempts), and the album thumbnail choice tolerates two jobs of one album finishing together.
The worker also runs on a cordoned node, and `kubectl drain --ignore-daemonsets` leaves it there
until the node shuts down; a job the reboot interrupts waits out those 15 minutes.
Each conversion needs about one CPU for libvips plus libaom's threads for AVIF and up to 400 MB for
a 100 megapixel input, which is what `resources.worker` is sized for.

## Media tasks

`mediaTask` runs one of the `src/bin` media scripts once as a Job with the worker image:
`script` names the script, `args` its arguments (every script is a dry run without `--apply`),
`nfs` mounts the export read-only, and `runId` names the Job, so bump it for every run. Set
`enabled: false` afterwards.

### Media backfill

The legacy migration copied media rows from the Django tables without opening the files: no file
size, and for camera portrait shots the original's dimensions in stored-pixel (landscape) order,
with previews that were rendered without applying the EXIF orientation tag.
`src/bin/backfill-media.ts` (the default `script`) inspects every row still lacking a size; it
fills sizes and displayed dimensions and queues a media job for each photo whose original carries
an orientation tag, which the worker then re-renders.

1. Values: `mediaTask.enabled: true`, `runId: 1`, `args: []`; push. Read the tally at the end
   of `kubectl -n <ns> logs job/media-task-1`: rows scanned should be about the site's media
   row count and rotated originals a fraction of the photos.
2. Values: `runId: 2`, `args: ["--apply"]`; push. Then watch the worker drain the queue:
   `select status, count(*) from v4_media_job group by 1`.
3. Rerunning is safe: a row is inspected once, and only rows whose file was missing come back.

## Moving top-level photos

Larppikuvat.fi keeps one top-level album per larp, with each photographer's photos in a subalbum
named after them. Photos uploaded straight into a top-level album break that. `moveTopLevelPhotos`
runs `src/bin/move-top-level-photos.ts` as a Job: for every top-level album holding photos it
creates a subalbum titled after the album's credited photographers, moves the photos, credits and
terms there (leaving redirects from the old photo paths) and keeps the album's other fields. An
album crediting no photographer is only warned about, as is one whose photographer subalbum
already exists. The Job needs no media mount: files never move.

1. Values: `moveTopLevelPhotos.enabled: true`, `runId: 1`, `args: []`; push. Read the plan in
   `kubectl -n larppikuvat-v4 logs job/move-top-level-photos-1`.
2. Values: `runId: 2`, `args: ["--apply"]`; push.
3. Rerunning is safe: an emptied top-level album is skipped. Set `enabled: false` afterwards, or
   leave it enabled and bump `runId` whenever photos land in a top-level album again.

`additionalHostnames` adds dnsNames to the Certificate without adding Gateway listeners. The TLS
Secret has the fixed name `tls-v4`, so the certificate survives a `hostname` change.

## History: hostname cutover and legacy Django admin (done 2026-09)

Until the v2 decommission, this chart also routed `/admin` and `/static` on the site hostname to
the legacy Django admin's Service in its own namespace via `legacy.namespace`/`legacy.service`/
`legacy.port` values and a ReferenceGrant created by the legacy manifests. That routing, and the
hostname cutover from `uusi.*` to the apex domain that preceded it, are both done; see git history
for the values and HTTPRoute rules involved.

## Deploy

```sh
helm upgrade --install v4 chart -n conikuvat-v4 -f chart/values-conikuvat.yaml \
  --set image.tag=<short sha> --wait --timeout 300s
```

CI does this on every push to `main`.
