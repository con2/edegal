# v4 Helm chart

Deploys the v4 gallery next to the legacy stack: a Next.js Deployment (with a Prisma migration
init container), an nginx Deployment serving `/media` from the shared NFS export, a per-namespace
Gateway with HTTPRoutes, and a cert-manager Certificate.

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

## Resources

`resources.*` in values sets requests and limits per container. The defaults were sized from
production usage with headroom for one 100 MB upload decoding at up to 100 megapixels in the web
process, and `workerConcurrency` such decodes in the worker. nginx memory is mostly reclaimable
page cache from the NFS export.

## Worker

The `worker` Deployment (image tag `<sha>-worker`) generates previews for uploaded photos. It shares the ConfigMap, Secret and NFS mount with the web Deployment; `workerConcurrency` in values controls parallel conversions.

## Deploy

```sh
helm upgrade --install v4 v4/chart -n conikuvat-v4 -f v4/chart/values-conikuvat.yaml \
  --set image.tag=<short sha> --wait --timeout 300s
```

CI does this on every push to `main` that touches `v4/`.
