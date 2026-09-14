# Edegal – Fast web image gallery

## Django REST API

This is the REST API backend for Edegal. Technology choices include the following:

* Python 3.14, dependencies managed with [uv](https://docs.astral.sh/uv/)
* Django 6.1
* PostgreSQL (15+)
* Redis
* [nginx](https://github.com/nginx/nginx)

## Getting started

### The Docker Compose way

This is the recommended way to develop Edegal. There is a single unified Docker Compose development environment for both the frontend and the backend. For instructions, see `README.md` in the parent directory.

### The uv way

If you want to develop the Edegal backend without Docker, you need `uv` and a PostgreSQL
database. `uv` installs the right Python for you.

    cd edegal/backend
    uv sync
    export DATABASE_URL=psql://edegal:edegal@localhost/edegal
    uv run manage.py test
    uv run manage.py setup --test
    uv run manage.py runserver

Lint and format with ruff:

    uv run ruff check .
    uv run ruff format .

Dependencies are declared in `pyproject.toml` and locked in `uv.lock`; `uv add <package>` adds one
and `uv lock --upgrade` refreshes all pins. The Docker image installs from the lock file.
