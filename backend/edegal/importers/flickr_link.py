from os.path import basename, splitext
from io import BytesIO

from django.db import transaction

from bs4 import BeautifulSoup
import requests

from ..models import Album, Media, MediaSpec, Picture
from ..models.album import GUESS_DATE_REGEXEN


def import_flickr_link(path, flickr_url, override_title=None, override_slug=None, leaf_album_title=None, strip_date_from_title=False):
    response = requests.get(flickr_url)
    soup = BeautifulSoup(response.text, 'html.parser')

    album_title = override_title if override_title else soup.find('meta', {'property': 'og:title'})['content']
    album_description = soup.find('meta', {'property': 'og:description'})['content']
    album_url = soup.find('meta', {'property': 'og:url'})['content']
    album_overrides = {} if override_slug is None else {'slug': override_slug}

    if album_description.startswith("Explore this photo album by"):
        # flickr default description
        album_description = ""

    if strip_date_from_title:
        for regex in GUESS_DATE_REGEXEN:
            if match := regex.search(album_title):
                date_str = match[0]

                album_description += f"\n{date_str}"
                album_description = album_description.strip()

                album_title = album_title[:match.start()] + album_title[match.end():]
                album_title = album_title.strip()

    cover_picture_url = soup.find('meta', {'property': 'og:image'})['content']
    cover_picture_filename = basename(cover_picture_url)
    cover_picture_title = splitext(cover_picture_filename)[0]

    cover_picture_response = requests.get(cover_picture_url)
    cover_picture_file = BytesIO(cover_picture_response.content)

    body = f"<h1>{album_title}</h1><p>{album_description}</p>"

    with transaction.atomic():
        parent = Album.objects.get(path=path)

        thumbnail_media_specs = MediaSpec.objects.filter(active=True, role='thumbnail')
        assert thumbnail_media_specs.exists()

        if leaf_album_title:
            intermediate_album = Album.objects.create(
                parent=parent,
                title=album_title,
                description=album_description,
                body=body,
                **album_overrides,
            )

            album = Album.objects.create(
                parent=intermediate_album,
                title=leaf_album_title,
                redirect_url=album_url,
            )
        else:
            album = Album.objects.create(
                parent=parent,
                title=album_title,
                description=album_description,
                body=body,
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
