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

## Getting started

### The Docker Compose Way

There is a single unified Docker Compose development environment for both the Django backend and the TypeScript/React frontend. Start the development environment with

    docker-compose up

Backend will start at http://localhost:8000 and frontend dev server will start at http://localhost:3000. Usually you will want to open the latter in your browser. A superuser will be created with username `mahti` and password `mahti`.

To run tests:

    alias dc-test="docker-compose --file=docker-compose.test.yml up --abort-on-container-exit --exit-code-from=test"
    dc-test

#### Caveats

* Due to deep magic performed by the `react-scripts` proxy, picture & album downloads do not work in local dev and you are offered `index.html` instead.

### The Traditional Way

For developing the backend or frontend components without Docker Compose, please see the set-up instructions in their respective README files under `backend/` and `frontend/`.

If you need not touch the backend, you can also develop against the Conikuvat.fi backend. This is the default for local non-Docker development in the frontend.

## Testimonials

* "That's mighty fast!"
* "I don't remember having ever run into another web gallery as nifty as this!"
* "I find the page load speed of Edegal incredible. But I think I've just grown accustomed to bad galleries."
* "Edegal seems exactly what I've been looking for!"
* "Edegal <3"
* "This sounds really good from the perspective of our operations team"

## Deployment

Rules of thumb for rolling your own deployment:

* Everyhing should be served from one hostname for now. Separate media host/CDN is currently not a priority but can be considered if the need arises.
* Only `/api` and `/admin` prefixes should be proxied to the backend. Everything else should be served from static files.
* Static files directories should be served by `nginx` or some other fast web server and organized as follows:
  * `/`: Read-only. Contents of `frontend/build` after `npm run build`.
  * `/static`: Read-only. Merged contents of `frontend/build/static` (after `npm run build`) and `backend/static` (after `python manage.py collectstatic`).
  * `/media`: Read-write.
    * `/media/downloads`: Download cache. Can be nuked whenever you feel like it – the worker will generate zip files upon request.
    * `/media/pictures`: Original pictures. Safeguard with your life (backups!).
    * `/media/previews`: Generated previews and thumbnails in JPEG and WebP. Can be regenerated if lost, but it takes time and CPU cycles.
    * `/media/uploads`: Admin-uploaded images for HTML content. Should also be carefully backed up.
* Serve `/index.html` when the request is not backed up by an actual file (`try_files $uri /index.html`).

### Kubernetes

The following services are required:

* [kubernetes-secret-generator](https://github.com/mittwald/kubernetes-secret-generator)
* [ingress-nginx](https://github.com/kubernetes/ingress-nginx) or some other ingress controller
* [cert-manager](https://github.com/jetstack/cert-manager)

The Kubernetes templates use [emrichen](https://github.com/con2/emrichen) for substituting variables and reducing repetition (`pip3 install emrichen`).

To deploy in a K8s cluster:

    kubectl create namespace edegal
    emrichen kubernetes/template.in.yml | kubectl apply -n edegal -f -

For production, you may want to use an external PostgreSQL (and maybe memcached and RabbitMQ).

### Ansible & Docker

**DEPRECATED**: Will stop being maintained once we move Conikuvat.fi and Larppikuvat.fi to Kubernetes.

See [here](https://github.com/tracon/ansible-tracon/tree/master/roles/edegal/).

## License

    The MIT License (MIT)

    Copyright © 2010–2020 Santtu Pajukanta

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
