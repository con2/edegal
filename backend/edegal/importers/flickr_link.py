from os.path import basename, splitext
from io import BytesIO

from django.db import transaction

from bs4 import BeautifulSoup
import requests

from ..models import Album, Media, MediaSpec, Picture


def import_flickr_link(path, flickr_url, override_title=None, override_slug=None):
    response = requests.get(flickr_url)
    soup = BeautifulSoup(response.text, 'html.parser')

    album_title = soup.find('meta', {'property': 'og:title'})['content'] if override_title is None else override_title
    album_description = soup.find('meta', {'property': 'og:description'})['content']
    album_url = soup.find('meta', {'property': 'og:url'})['content']
    album_overrides = {} if override_slug is None else {'slug': override_slug}

    cover_picture_url = soup.find('meta', {'property': 'og:image'})['content']
    cover_picture_filename = basename(cover_picture_url)
    cover_picture_title = splitext(cover_picture_filename)[0]

    cover_picture_response = requests.get(cover_picture_url)
    cover_picture_file = BytesIO(cover_picture_response.content)

    with transaction.atomic():
        parent = Album.objects.get(path=path)

        thumbnail_media_specs = MediaSpec.objects.filter(active=True, role='thumbnail')
        assert thumbnail_media_specs.exists()

        album = Album.objects.create(
            parent=parent,
            title=album_title,
            description=album_description,
            redirect_url=album_url,
            **album_overrides,
        )

        picture = Picture.objects.create(
            album=album,
            title=cover_picture_title,
        )

    Media.import_open_file(
        picture=picture,
        input_file=cover_picture_file,
        media_specs=thumbnail_media_specs,
        refresh_album=True,
    )
