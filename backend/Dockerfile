FROM python:3.13
WORKDIR /usr/src/app
COPY requirements.txt /usr/src/app/
RUN groupadd -g 1082 -r conikuvat && useradd -r -u 1082 -g conikuvat -G users conikuvat && \
    pip install -U pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt
COPY . /usr/src/app
RUN env DEBUG=1 python manage.py collectstatic --noinput && \
    python -m compileall -q . && \
    mkdir -p /usr/src/app/media && \
    chown conikuvat:conikuvat /usr/src/app/media
VOLUME /usr/src/app/media
USER conikuvat
EXPOSE 8000
ENTRYPOINT ["/usr/src/app/scripts/docker-entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
