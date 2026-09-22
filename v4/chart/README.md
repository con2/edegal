# v4 Helm chart

Deploys the v4 gallery: a Next.js Deployment (with a Prisma migration init container), an nginx
Deployment serving `/media` from the shared NFS export, a per-namespace Gateway with HTTPRoutes,
and a cert-manager Certificate.

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
to development defaults.

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

## Resources

`resources.*` in values sets requests and limits per container. The defaults were sized from
production usage with headroom for one 100 MB upload decoding at up to 100 megapixels in the web
process, and `workerConcurrency` such decodes in the worker. nginx memory is mostly reclaimable
page cache from the NFS export.

## Worker

The `worker` Deployment (image tag `<sha>-worker`) generates previews for uploaded photos. It shares
the ConfigMap, Secret and NFS mount with the web Deployment. `worker.replicas` processes run
`workerConcurrency` conversions each; the pods spread across nodes. Scaling is safe: jobs are
claimed with `SKIP LOCKED`, a job whose process died is requeued after 15 minutes (and failed once
out of attempts), and the album thumbnail choice tolerates two jobs of one album finishing together.
Each conversion needs about one CPU for libvips plus libaom's threads for AVIF and up to 400 MB for
a 100 megapixel input, which is what `resources.worker` is sized for.

## Media backfill

The legacy migration copied media rows from the Django tables without opening the files: no file
size, and for camera portrait shots the original's dimensions in stored-pixel (landscape) order,
with previews that were rendered without applying the EXIF orientation tag. `mediaBackfill` runs
`src/bin/backfill-media.ts` once as a Job against every row still lacking a size; it fills sizes
and displayed dimensions and queues a media job for each photo whose original carries an
orientation tag, which the worker Deployment then re-renders. The Job mounts the export read-only.

1. Values: `mediaBackfill.enabled: true`, `runId: 1`, `args: []`; push. Read the tally at the end
   of `kubectl -n <ns> logs job/media-backfill-1`: rows scanned should be about the site's media
   row count and rotated originals a fraction of the photos.
2. Values: `runId: 2`, `args: ["--apply"]`; push. Then watch the worker drain the queue:
   `select status, count(*) from v4_media_job group by 1`.
3. Rerunning is safe: a row is inspected once, and only rows whose file was missing come back.
   Set `enabled: false` afterwards.

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
helm upgrade --install v4 v4/chart -n conikuvat-v4 -f v4/chart/values-conikuvat.yaml \
  --set image.tag=<short sha> --wait --timeout 300s
```

CI does this on every push to `main` that touches `v4/`.
