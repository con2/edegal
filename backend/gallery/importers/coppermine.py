import html
import logging
import shutil
from collections import namedtuple
from os import makedirs
from os.path import basename, dirname, splitext, abspath

from django.conf import settings
from django.db import connections

from ..models import Album, Media, MediaSpec, Picture

from ..utils import slugify, log_get_or_create


logger = logging.getLogger(__name__)


GET_CATEGORIES_SQL = """
SELECT cid, name, description, pos
FROM cpg11d_categories
WHERE parent = ?
ORDER BY pos
"""

GET_ALBUMS_SQL = """
SELECT aid, title, description, pos
FROM cpg11d_albums
WHERE category = ?
ORDER BY pos
"""

GET_PICTURES_SQL = """
SELECT pid, filename, filepath, title, caption, position
FROM cpg11d_pictures
WHERE aid = ?
ORDER BY position
"""


class CoppermineAttributes(object):
    @property
    def title(self):
        return html.unescape(self.title_html)

    @property
    def description(self):
        return html.unescape(self.description_html)

    @property
    def slug(self):
        return slugify(self.title)


BaseCoppermineAlbum = namedtuple('CoppermineAlbum', 'id title_html description_html pos')
class CoppermineAlbum(BaseCoppermineAlbum, CoppermineAttributes):
    """
    Represents a category or album in Coppermine. Fields need to correspond to SQL query fields
    by position.
    """

    def get_or_create(self, parent_album):
        album, created = Album.objects.get_or_create(
            parent=parent_album,
            slug=coppermine_category.slug,
            defaults=dict(
                title=coppermine_category.title,
                description=coppermine_category.description,
            )
        )

        log_get_or_create(logger, album, created)

        return album, created


BaseCopperminePicture = namedtuple('CopperminePicture', [
    'id'
    'filename'
    'filepath'
    'title_html'
    'description_html'
    'position'
])
class CopperminePicture(BaseCopperminePicture, CoppermineAttributes):
    """
    Represents a picture in Coppermine. Fields need to correspond to SQL query fields by position.
    """

    @property
    def title(self):
        return html.unescape(self.title_html).replace(' - ', ' – ') # it's an en dash

    def get_or_create(self, parent_album):
        title = self.title if self.title_html else self.filename

        picture, created = Picture.objects.get_or_create(
            album=parent_album,
            slug=slugify(title),
            defaults=dict(
                title=title,
                description=self.description,
                order=self.position,
            )
        )


class CoppermineImporter(object):
    def __init__(
        self,
        path='/',
        connection_name='coppermine',
        root_category_id=0,
        mode='inplace'
    ):
        self.path = path
        self.connection = connections[connection_name]
        self.root_category = CoppermineAlbum(root_category_id, None, None, None)
        self.mode = mode
        self.media_specs = MediaSpec.objects.all()

    def run(self):
        # TODO query("SET NAMES 'latin1';") ?
        parent_album = Album.objects.get(path=self.path)
        self.import_subcategories(self.root_category, parent_album)

    def import_subcategories(self, coppermine_category, parent_album):
        with self.connection.cursor() as cursor:
            cursor.execute(GET_CATEGORIES_SQL, coppermine_category.id)
            for row in cursor.fetchall():
                self.import_category(CoppermineAlbum(*row), parent_album)

    def import_albums(self, coppermine_category, parent_album):
        with self.connection.cursor() as cursor:
            cursor.execute(GET_ALBUMS_SQL, coppermine_category.id)
            for row in cursor.fetchall():
                self.import_album(CoppermineAlbum(*row), parent_album)

    def import_pictures(self, coppermine_album, parent_album):
        with self.connection.cursor() as cursor:
            cursor.execute(GET_PICTURES_SQL, coppermine_album.id)
            for row in cursor.fetchall():
                self.import_picture(CopperminePicture(*row), parent_album)

    def import_category(self, coppermine_category, parent_album):
        album = coppermine_category.to_edegal(parent_album)

        self.import_subcategories(coppermine_category, album)
        self.import_albums(coppermine_category, album)

    def import_album(self, coppermine_album, parent_album):
        album = coppermine_album.to_edegal(parent_album)

        self.import_pictures(coppermine_album, album)

    def import_picture(self, coppermine_picture, parent_album):
        picture = coppermine_picture.to_edegal(parent_album)
        picture.import_local_media(picture.filepath, mode=self.mode)

