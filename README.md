# Edegal – A web picture gallery

Edegal is a web picture gallery written in Python 3 and TypeScript and designed with performance and scalability in mind.

This is the "version 2" reboot of the Edegal project. It incorporates the following changes to "version 1":

* MongoDB is dead, long live PostgreSQL (and Redis)
* Replace the Node.js backend with Python 3.8 and Django 3.0
* Rewrite frontend in TypeScript instead of CoffeeScript or ECMAScript 6

High performance is achieved through the usage of a dead simple REST JSON API in which most cache misses only result in two database queries.

See it live:

* [Conikuvat.fi](https://conikuvat.fi) – pictures from anime & cosplay conventions in Finland
* [Larppikuvat.fi](https://larppikuvat.fi) – pictures from LARPs in Finland

## Repository layout

* `v4/` – the gallery itself: Next.js 16 + Prisma 8, served at the site root. See `v4/README.md`.
* `v2-backend/` – the previous Django backend, kept for its admin at `/admin` until the remaining
  editing features move to v4. Shares the PostgreSQL database and media directory with v4. See
  `v2-backend/README.md`.
* `spec/` – design notes for the rewrite.

## Testimonials

* "That's mighty fast!"
* "I don't remember having ever run into another web gallery as nifty as this!"
* "I find the page load speed of Edegal incredible. But I think I've just grown accustomed to bad galleries."
* "Edegal seems exactly what I've been looking for!"
* "Edegal <3"
* "This sounds really good from the perspective of our operations team"

## Deployment

Both sites run on Kubernetes behind Traefik with the Gateway API.

* v4 is a Helm chart in `v4/chart/`, deployed by `.github/workflows/v4.yaml`. Its Gateway owns the
  site hostname and routes `/admin` and `/static` to the Django Service in the legacy namespace. See
  `v4/chart/README.md`.
* The Django backend is deployed with [Emskaffolden](https://github.com/con2/emskaffolden)
  (Skaffold + Emrichen) from `v2-backend/kubernetes/`, by `.github/workflows/v2-backend.yaml`. To
  deploy elsewhere, copy `v2-backend/kubernetes/staging.vars.yaml` under your environment name and
  run `emskaffolden -E myenv -- run --default-repo=...` in `v2-backend/`.

Media lives on a shared NFS export (`/media/pictures` holds the originals: back them up), and both
apps talk to the same PostgreSQL database.

## License

    The MIT License (MIT)

    Copyright © 2010-2025 Luka Pajukanta

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
