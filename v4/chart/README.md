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

## Deploy

```sh
helm upgrade --install v4 v4/chart -n conikuvat-v4 -f v4/chart/values-conikuvat.yaml \
  --set image.tag=<short sha> --wait --timeout 300s
```

CI does this on every push to `main` that touches `v4/`.
