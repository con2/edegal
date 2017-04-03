# Edegal – Fast web image gallery

## Django REST API

This is the REST API backend for Edegal. Technology choices include the following:

* Python 3.6
* Django 1.10
* Django Rest Framework
* PostgreSQL 9.5
* Redis
* [nginx](https://github.com/nginx/nginx)

## Getting started

### The Docker Compose way

This is the recommended way to develop Edegal. There is a single unified Docker Compose development environment for both the frontend and the backend. For instructions, see `README.md` in the parent directory.

### The Traditional Way

If, for some reason, you want to develop the Edegal backend without using Docker, follow these instructions.

What is assumed:

* An UNIX-like operating system such as Ubuntu, CentOS or Mac OS X
* Python 3.6 and a working `virtualenv` or `venv` tool

Cheats for Debian/Ubuntu:

    sudo apt-get install python3 python3-dev python3-virtualenv libjpeg-dev libpq-dev

Set up backend development environment

    git clone https://github.com/conikuvat/edegal
    python3 -m venv venv3-edegal2 # or python3.4 -m virtualenv
    source venv3-edegal2/bin/activate
    cd edegal/backend
    pip install -r requirements.txt
    python manage.py test
    python manage.py setup --test

Running a local server:

    python manage.py runserver
    iexplore http://localhost:8000
