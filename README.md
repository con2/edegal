# Work in progress

Please hold tight as we rewrite the backend in Python 3 and the frontend in ECMAScript 6.

The "legacy" branch, with a Node.js backend and MongoDB as the database, can still be found at [japsu/edegal-legacy](https://github.com/japsu/edegal-legacy).

# Edegal – A web picture gallery

Edegal is a web picture gallery written in Python 3 and ECMAScript 6 and designed with performance and scalability in mind.

This is the "version 2" reboot of the Edegal project. It incorporates the following changes to "version 1":

* MongoDB is dead, long live PostgreSQL (and Redis)
* Replace the Node.js backend with Python 3.4 and Django 1.8
* Rewrite frontend in ECMAScript 6 instead of CoffeeScript

High performance is achieved through the usage of a dead simple REST JSON API in which most cache misses only result in two database queries.

Edegal is a work in progress. See a demo at [uusi.kuvat.aniki.fi](http://uusi.kuvat.aniki.fi/) or [gallery.insomnia.fi](http://gallery.insomnia.fi).

## Goals

* Successfully replace Coppermine Image Gallery at [kuvat.aniki.fi](http://kuvat.aniki.fi)
  * 49,860 files in 619 albums and 110 categories viewed 6,118,935 times over the course of 9 years (as of 22nd June 2013)
* Provide picture galleries for the members of [Kapsi Internet-käyttäjät ry](http://www.kapsi.fi) requestable via a web self-service portal
* Drop some jaws with stunning visuals and flawless usability
* Become the number one choice for a self-hosted image gallery for serious hobbyist photographers

## Getting started

What is assumed:

* An UNIX-like operating system such as Ubuntu, CentOS or Mac OS X
* Python 3.4 and a working `virtualenv` tool
  * HINT: Debian/Ubuntu have broken the standard library `venv` due to brain damage. Install `python3-virtualenv` and use `python3 -m virtualenv` instead
  * On OS X, go on using the standard `venv`

Cheats for Debian/Ubuntu:

    sudo apt-get install python3 python3-dev python3-virtualenv libjpeg-dev libpq-dev

Set up backend development environment

    git clone https://github.com/japsu/edegal2
    python3.4 -m venv venv3-edegal2 # or python3.4 -m virtualenv
    source venv3-edegal2/bin/activate
    cd edegal2
    pip install -r requirements.txt
    python manage.py test
    python manage.py setup --test

Running a local server:

    python manage.py runserver
    iexplore http://localhost:8000

Set up frontend development environment:

    npm install
    npm test
    npm start

Do a minified production build:

    NODE_ENV=production npm run build

## Technology choices


* Backend
  * Python 3.4
  * Django 1.8
  * PostgreSQL 9.4
  * Redis
  * [nginx](https://github.com/nginx/nginx)
* Frontend development tools
  * [Node.js](https://github.com/joyent/node)
  * [Gulp](https://github.com/gulp/gulp)
  * ECMAScript 2015 via Babelify
  * [Jade](https://github.com/visionmedia/jade) templates for static HTML
  * [Stylus](https://github.com/learnboost/stylus)
  * [UglifyJS](https://github.com/mishoo/UglifyJS2)
  * [Mocha](https://github.com/visionmedia/mocha)
  * [Sinon](https://github.com/cjohansen/Sinon.JS)
* Frontend
  * [Knockout](https://github.com/knockout/knockout)
  * [Knockout.Mapping](https://github.com/SteveSanderson/knockout.mapping)
  * [Page.js](https://github.com/visionmedia/page.js)
  * [Hammer.js](https://github.com/EightMedia/hammer.js)
  * [JQuery 1.11](https://github.com/jquery/jquery)

## Testimonials

* "That's mighty fast!"
* "I don't remember having ever run into another web gallery as nifty as this!"
* "I find the page load speed of Edegal incredible. But I think I've just grown accustomed to bad galleries."
* "Edegal seems exactly what I've been looking for!"
* "Edegal <3"
* "This sounds really good from the perspective of our operations team"
