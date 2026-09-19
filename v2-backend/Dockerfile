FROM ghcr.io/astral-sh/uv:python3.14-bookworm AS deps
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV UV_PYTHON_DOWNLOADS=0

WORKDIR /usr/src/app
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-install-project --no-dev


FROM deps AS test
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-install-project
COPY . /usr/src/app
ENV PATH="/usr/src/app/.venv/bin:$PATH"


FROM deps AS build
COPY . /usr/src/app
ENV PATH="/usr/src/app/.venv/bin:$PATH"
RUN env DEBUG=1 python manage.py collectstatic --noinput && \
    python -m compileall -q edegal edegal_site kompassi_oauth2 larppikuvat && \
    chmod 755 manage.py scripts/*.sh


FROM python:3.14-slim-bookworm AS runtime

# uid 1082 owns the media files on the NFS export; -G users matches the legacy setup.
RUN groupadd -g 1082 -r conikuvat && useradd -r -u 1082 -g conikuvat -G users conikuvat && \
    apt-get update && apt-get -y install --no-install-recommends libpq5 && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app
COPY --from=build --chown=root:root /usr/src/app /usr/src/app
RUN mkdir -p /usr/src/app/media && chown conikuvat:conikuvat /usr/src/app/media
ENV PATH="/usr/src/app/.venv/bin:$PATH"

VOLUME /usr/src/app/media
USER conikuvat
EXPOSE 8000
ENTRYPOINT ["/usr/src/app/scripts/docker-entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
