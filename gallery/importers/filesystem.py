import logging
import shutil
from os import makedirs
from os.path import basename, dirname, splitext, abspath

from django.conf import settings

from ..models import Album, Media, Picture

from ..utils import slugify
from ..helpers import log_get_or_create


logger = logging.getLogger(__name__)


class FilesystemImporter(object):
    def __init__(self, path, input_filenames, mode='inplace'):
        self.path = path
        self.input_filenames = input_filenames
        self.mode = mode

    def get_or_create_picture(self, album, input_filename):
        title = splitext(basename(input_filename))[0]
        slug = slugify(title)

        picture, created = Picture.objects.get_or_create(
            album=album,
            slug=slug,
            defaults=dict(
                title=title,
            )
        )

        log_get_or_create(logger, picture, created)

        return picture, created

    def process_file_location(self, original_media, input_filename):
        if self.mode == 'inplace':
            original_path = abspath(input_filename)
        elif self.mode in ('copy', 'move'):
            original_path = original_media.get_canonical_path()
            makedirs(dirname(original_path), exist_ok=True)

            if self.mode == 'copy':
                shutil.copyfile(input_filename, original_path)
            elif self.mode == 'move':
                shutil.move(input_filename, original_path)
            else:
                raise NotImplementedError(self.mode)
        else:
            raise NotImplementedError(self.mode)

        return self.make_absolute_path_media_relative(original_path)

    def make_absolute_path_media_relative(self, original_path):
        assert original_path.startswith(settings.MEDIA_ROOT)

        # make path relative to /media/
        original_path = original_path[len(settings.MEDIA_ROOT):]

        # remove leading slash
        if original_path.startswith('/'):
            original_path = original_path[1:]

        return original_path

    def get_or_create_original_media(self, picture, input_filename):
        media, created = Media.objects.get_or_create(
            picture=picture,
            spec=None,
        )

        if not media.src:
            media.src = self.process_file_location(media, input_filename)
            media.save()

        log_get_or_create(logger, media, created)

        return media, created

    def run(self):
        album = Album.objects.get(path=self.path)

        logger.info("Importing {num_files} files into {path}".format(
            num_files=len(self.input_filenames),
            path=self.path,
        ))

        for input_filename in self.input_filenames:
            picture, unused = self.get_or_create_picture(album, input_filename)
            original_media, unused = self.get_or_create_original_media(picture, input_filename)
