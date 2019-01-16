# Work in progress

Please hold tight as we rewrite the backend in Python 3 and the frontend in TypeScript.

The "legacy" branch, with a Node.js backend and MongoDB as the database, can still be found at [japsu/edegal-legacy](https://github.com/japsu/edegal-legacy). See a demo of `edegal-legacy` at [uusi.kuvat.aniki.fi](http://uusi.kuvat.aniki.fi/).

# Edegal – A web picture gallery

Edegal is a web picture gallery written in Python 3 and TypeScript and designed with performance and scalability in mind.

This is the "version 2" reboot of the Edegal project. It incorporates the following changes to "version 1":

* MongoDB is dead, long live PostgreSQL (and Redis)
* Replace the Node.js backend with Python 3.6 and Django 1.10
* Rewrite frontend in TypeScript instead of CoffeeScript or ECMAScript 6

High performance is achieved through the usage of a dead simple REST JSON API in which most cache misses only result in two database queries.

Edegal is a work in progress.

## Goals

* Successfully replace Coppermine Image Gallery at [kuvat.aniki.fi](http://kuvat.aniki.fi)
  * 92,571 pictures in 1,314 albums, 8,546,875 total views over the course of 13 years. (as of 3rd April 2017)
* Provide picture galleries for the members of [Kapsi Internet-käyttäjät ry](http://www.kapsi.fi) requestable via a web self-service portal
* Drop some jaws with stunning visuals and flawless usability
* Become the number one choice for a self-hosted image gallery for serious hobbyist photographers

## Getting started

### The Docker Compose Way

There is a single unified Docker Compose development environment for both the Django backend and the TypeScript/React frontend. Start the development environment with

    docker-compose up

Backend will start at http://localhost:8000 and frontend dev server will start at http://localhost:3000. Usually you will want to open the latter in your browser. A superuser will be created with username `mahti` and password `mahti`.

To run tests:

    alias dc-test="docker-compose --file=docker-compose.test.yml up --abort-on-container-exit --exit-code-from=test"
    dc-test

### The Traditional Way

For developing the backend or frontend components without Docker Compose, please see the set-up instructions in their respective README files under `backend/` and `frontend/`.

## Testimonials

* "That's mighty fast!"
* "I don't remember having ever run into another web gallery as nifty as this!"
* "I find the page load speed of Edegal incredible. But I think I've just grown accustomed to bad galleries."
* "Edegal seems exactly what I've been looking for!"
* "Edegal <3"
* "This sounds really good from the perspective of our operations team"

## License

    The MIT License (MIT)

    Copyright © 2010–2019 Santtu Pajukanta

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
