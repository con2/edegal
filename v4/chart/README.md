# v4 Helm chart

Deploys the v4 gallery: a Next.js Deployment (with a Prisma migration init container), an nginx
Deployment serving `/media` from the shared NFS export, a per-namespace Gateway with HTTPRoutes,
and a cert-manager Certificate. The Gateway also fronts the legacy Django admin (see below).

## Prerequisites per namespace (`conikuvat-v4`, `larppikuvat-v4`)

```sh
kubectl create namespace conikuvat-v4
kubectl -n conikuvat-v4 create secret generic v4 \
  --from-literal=DATABASE_URL='postgresql://conikuvat:...@siilo.tracon.fi/conikuvat?sslmode=require' \
  --from-literal=AUTH_SECRET="$(openssl rand -base64 32)" \
  --from-literal=KOMPASSI_OIDC_CLIENT_ID=... \
  --from-literal=KOMPASSI_OIDC_CLIENT_SECRET=...
```

The Kompassi OIDC client must allow the redirect URI `https://<hostname>/api/auth/callback/kompassi`.
All four keys are mandatory: the server refuses to start without them rather than falling back
to development defaults.

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

## Legacy Django admin

`legacy.namespace` (with `legacy.service` and `legacy.port`) routes `/admin` and `/static` on the
same hostname to the legacy stack's Django Service in that namespace. Django serves its own static
files through whitenoise, so no other backend is involved. The legacy namespace must hold a
ReferenceGrant allowing this namespace's HTTPRoute to target the Service; the legacy manifests
create one when `v4_namespace` is set. An empty `legacy.namespace` renders neither route.

`additionalHostnames` adds dnsNames to the Certificate without adding Gateway listeners. The TLS
Secret has the fixed name `tls-v4`, so the certificate survives a `hostname` change.

## Hostname cutover runbook (uusi.* -> apex, done 2026-09)

1. Values: `additionalHostnames: [<apex>]`, `legacy.namespace: <legacy ns>`; push. Check
   `kubectl -n <ns> get certificate v4` is Ready with both names and
   `kubectl -n <ns> get httproute app -o yaml` reports `ResolvedRefs=True`.
   `curl -sI https://uusi.<apex>/static/admin/css/base.css` returns 200.
2. Add `https://<apex>/api/auth/callback/kompassi` to the v4 OIDC client in Kompassi.
3. Values: `hostname: <apex>`, `additionalHostnames: []`; push. Until step 4 the legacy Ingress
   still claims the host too, and Traefik may hand `/` to either backend.
4. In the legacy namespace, one resource per command since skaffold does not prune:
   `kubectl delete ingress edegal`, `kubectl delete deployment nginx`, `kubectl delete service nginx`. Redirect `uusi.<apex>` to the apex out of band.

## Deploy

```sh
helm upgrade --install v4 v4/chart -n conikuvat-v4 -f v4/chart/values-conikuvat.yaml \
  --set image.tag=<short sha> --wait --timeout 300s
```

CI does this on every push to `main` that touches `v4/`.
