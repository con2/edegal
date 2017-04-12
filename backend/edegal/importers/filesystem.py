import logging
from os.path import basename, splitext

from django.conf import settings

from ..models import Album, Media, Picture

from ..utils import slugify, log_get_or_create

logger = logging.getLogger(__name__)


class FilesystemImporter(object):
    def __init__(self, path, input_filenames, mode='inplace'):
        self.path = path
        self.input_filenames = input_filenames
        self.mode = mode
        self.counter = 0

    def get_ordering_number(self):
        self.counter += 10
        return self.counter

    def get_or_create_picture(self, album, input_filename):
        title = splitext(basename(input_filename))[0]
        slug = slugify(title)

        picture, created = Picture.objects.get_or_create(
            album=album,
            slug=slug,
            defaults=dict(
                title=title,
                order=self.get_ordering_number(),
            )
        )

        log_get_or_create(logger, picture, created)

        return picture, created

    def run(self):
        album = Album.objects.get(path=self.path)

        logger.info("Importing {num_files} files into {path}".format(
            num_files=len(self.input_filenames),
            path=self.path,
        ))

        for index, input_filename in enumerate(self.input_filenames):
            picture, unused = self.get_or_create_picture(album, input_filename)
            Media.import_local_media(
                picture,
                input_filename,
                mode=self.mode,
                refresh_album=(index == 0),
            )
