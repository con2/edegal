import html
import logging
import os
from collections import namedtuple

from django.db import connections

from ..models import Album, Media, MediaSpec, Picture, TermsAndConditions

from ..utils import slugify, log_get_or_create


logger = logging.getLogger(__name__)


SET_ENCODING_SQL = "SET NAMES 'latin1'"

GET_CATEGORIES_SQL = """
SELECT cid, name, description, pos
FROM cpg11d_categories
WHERE parent = %s
ORDER BY pos
"""

GET_ALBUMS_SQL = """
SELECT aid, title, description, pos
FROM cpg11d_albums
WHERE category = %s
ORDER BY pos
"""

GET_PICTURES_SQL = """
SELECT pid, filename, filepath, title, caption, position
FROM cpg11d_pictures
WHERE aid = %s
ORDER BY position
"""

# These will be stripped from filenames when making up titles
STRIP_SUFFIXES = [
    '.jpg',
    '.jpeg',
]


class CoppermineAttributes(object):
    @property
    def title(self):
        return html.unescape(self.title_html).replace(' - ', ' – ')  # en dash

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

    def get_or_create(self, parent_album, description_is_terms_and_conditions=False):
        if description_is_terms_and_conditions:
            tac, created = TermsAndConditions.get_or_create(self.description, is_public=False)

            album, created = Album.objects.get_or_create(
                parent=parent_album,
                slug=self.slug,
                defaults=dict(
                    title=self.title,
                    terms_and_conditions=tac,
                )
            )

        else:
            album, created = Album.objects.get_or_create(
                parent=parent_album,
                slug=self.slug,
                defaults=dict(
                    title=self.title,
                    description=self.description,
                )
            )

        log_get_or_create(logger, album, created)

        return album, created


BaseCopperminePicture = namedtuple('CopperminePicture', [
    'id',
    'filename',
    'filepath',
    'title_html',
    'description_html',
    'position',
])


class CopperminePicture(BaseCopperminePicture, CoppermineAttributes):
    """
    Represents a picture in Coppermine. Fields need to correspond to SQL query fields by position.
    """

    def get_or_create(self, parent_album):
        title = self.title if self.title_html else self.title_from_filename

        picture, created = Picture.objects.get_or_create(
            album=parent_album,
            slug=slugify(title),
            defaults=dict(
                title=title,
                description=self.description,
                order=self.position,
            )
        )

        log_get_or_create(logger, picture, created)

        return picture, created

    @property
    def title_from_filename(self):
        for suffix in STRIP_SUFFIXES:
            if self.filename.lower().endswith(suffix):
                return self.filename[:-len(suffix)]

        return self.filename


class CoppermineImporter(object):
    def __init__(
        self,
        path='/',
        connection_name='coppermine',
        root_category_id=0,
        mode='inplace',
        create_previews=True,
        media_root='',
        description_is_terms_and_conditions=False,
        exclude_category_ids=[],
    ):
        self.path = path
        self.connection = connections[connection_name]
        self.root_category = CoppermineAlbum(root_category_id, None, None, None)
        self.mode = mode
        self.media_specs = MediaSpec.objects.all() if create_previews else MediaSpec.objects.none()
        self.media_root = media_root
        self.description_is_terms_and_conditions = description_is_terms_and_conditions
        self.exclude_category_ids = set(exclude_category_ids)

        assert self.root_category not in self.exclude_category_ids

    def run(self):
        with self.connection.cursor() as cursor:
            cursor.execute(SET_ENCODING_SQL)

        parent_album = Album.objects.get(path=self.path)
        self.import_subcategories(self.root_category, parent_album)
        self.import_albums(self.root_category, parent_album)

    def import_subcategories(self, coppermine_category, parent_album):
        with self.connection.cursor() as cursor:
            cursor.execute(GET_CATEGORIES_SQL, [coppermine_category.id])
            for row in cursor.fetchall():
                self.import_category(CoppermineAlbum(*row), parent_album)

    def import_albums(self, coppermine_category, parent_album):
        with self.connection.cursor() as cursor:
            cursor.execute(GET_ALBUMS_SQL, [coppermine_category.id])
            for row in cursor.fetchall():
                self.import_album(CoppermineAlbum(*row), parent_album)

    def import_pictures(self, coppermine_album, parent_album):
        with self.connection.cursor() as cursor:
            cursor.execute(GET_PICTURES_SQL, [coppermine_album.id])
            for row in cursor.fetchall():
                self.import_picture(CopperminePicture(*row), parent_album)

    def import_category(self, coppermine_category, parent_album):
        if coppermine_category.id in self.exclude_category_ids:
            logger.debug('Skipping category %d', coppermine_category.id)
            return

        album, created = coppermine_category.get_or_create(parent_album)

        self.import_subcategories(coppermine_category, album)
        self.import_albums(coppermine_category, album)

    def import_album(self, coppermine_album, parent_album):
        album, created = coppermine_album.get_or_create(parent_album,
            description_is_terms_and_conditions=self.description_is_terms_and_conditions,
        )

        self.import_pictures(coppermine_album, album)

        # update thumbnails
        album.save()

    def import_picture(self, coppermine_picture, parent_album):
        picture, created = coppermine_picture.get_or_create(parent_album)
        absolute_filename = os.path.join(self.media_root, coppermine_picture.filepath, coppermine_picture.filename)
        Media.import_local_media(picture, absolute_filename, mode=self.mode, media_specs=self.media_specs)

