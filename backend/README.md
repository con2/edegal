# Edegal – Fast web image gallery

## Django REST API

This is the REST API backend for Edegal. Technology choices include the following:

* Python (3.11+)
* Django (4.2+)
* PostgreSQL (15+)
* Redis
* [nginx](https://github.com/nginx/nginx)

## Getting started

### The Docker Compose way

This is the recommended way to develop Edegal. There is a single unified Docker Compose development environment for both the frontend and the backend. For instructions, see `README.md` in the parent directory.

### The Traditional Way

If, for some reason, you want to develop the Edegal backend without using Docker, follow these instructions. Note that you have to setup the frontend for development separately: see `frontend/README.md`.

What is assumed:

* An UNIX-like operating system such as Ubuntu, CentOS or Mac OS X
* Python 3.8 and a working `virtualenv` or `venv` tool

Cheats for Debian/Ubuntu:

    sudo apt-get install python3 python3-dev python3-virtualenv libjpeg-dev libpq-dev

Set up backend development environment

    git clone https://github.com/conikuvat/edegal
    python3 -m venv venv3-edegal
    source venv3-edegal/bin/activate
    cd edegal/backend
    pip install -r requirements.txt
    python manage.py test
    python manage.py setup --test

Running a local server:

    python manage.py runserver
    iexplore http://localhost:8000
