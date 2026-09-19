# Conikuvat.fi / Larppikuvat.fi photo gallery v4 ("Edegal")

This repo serves [Conikuvat.fi](https://conikuvat.fi) (pictures from anime and cosplay conventions in
Finland) and [Larppikuvat.fi](https://larppikuvat.fi) (pictures from larps in Finland).

## Repository layout

- `v4/` – the gallery: a Next.js 16 application on PostgreSQL via Prisma 8, with Kompassi sign-in
  through Auth.js, uploads with a separate media worker, album and photographer management, on-demand
  album zips, a contact form and a Helm chart in `v4/chart/`. See `v4/README.md`.
- `v2-backend/` – the previous Django backend, kept for its admin at `/admin` until the remaining
  editing features move to v4. It shares the PostgreSQL database and the media directory with v4.
  See `v2-backend/README.md`.

The React frontend of the previous generation and the design notes of the rewrite have been removed;
they live in the git history.

## Development

Each application documents its own setup: `v4/README.md` (Node, PostgreSQL, `npm run dev`) and
`v2-backend/README.md` (uv or Docker Compose). Both can point at the same local database, which is
how legacy albums show up in a local v4.

## Deployment

Both sites run on Kubernetes behind Traefik with the Gateway API.

- v4 is deployed from `v4/chart/` by `.github/workflows/v4.yaml` on every push to `main` that touches
  `v4/`. Its Gateway owns the site hostname and routes `/admin` and `/static` to the Django Service in
  the legacy namespace. See `v4/chart/README.md`.
- The Django backend is deployed with [Emskaffolden](https://github.com/con2/emskaffolden)
  (Skaffold + Emrichen) from `v2-backend/kubernetes/` by `.github/workflows/v2-backend.yaml`. To
  deploy elsewhere, copy `v2-backend/kubernetes/staging.vars.yaml` under your environment name and
  run `emskaffolden -E myenv -- run --default-repo=...` in `v2-backend/`.

Media lives on a shared NFS export. `/media/pictures` holds the originals: back them up. Previews
and thumbnails under `/media/previews` can be regenerated.

## Want to use it for your own picture gallery?

Have your pet clanker redo the authentication and authorization in
`v4/src/auth.ts` to support whatever OIDC backend you may be using. [Auth.js v5](https://authjs.dev/)
supports a wide variety of OIDC providers out of the box.

You probably won't need the legacy part. Set `LEGACY_ENABLED=false` and skip deploying the v2 backend.

## License

    The MIT License (MIT)

    Copyright © 2010-2026 Luka Pajukanta

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
