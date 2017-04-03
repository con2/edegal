import shutil
import logging
from contextlib import contextmanager
from os import makedirs
from os.path import dirname, abspath

from django.conf import settings
from django.db import models

from PIL import Image

from ..utils import pick_attrs, log_get_or_create
from .media_spec import MediaSpec


logger = logging.getLogger(__name__)


class Media(models.Model):
    picture = models.ForeignKey('edegal.Picture', related_name='media')
    width = models.PositiveIntegerField(default=0)
    height = models.PositiveIntegerField(default=0)
    src = models.ImageField(
        null=True,
        max_length=255,
        width_field='width',
        height_field='height',
    )
    spec = models.ForeignKey(MediaSpec, null=True, blank=True)

    def as_dict(self):
        return pick_attrs(self,
            'width',
            'height',
            src=self.src.url,
            original=self.is_original,
        )

    @property
    def is_original(self):
        return self.spec is None

    @property
    def path(self):
        return self.src

    def get_canonical_path(self, prefix=settings.MEDIA_ROOT + '/'):
        """
        Returns the canonical path of this medium. This is where the file would be stored
        unless in-place mode was used.

        Originals: /media/pictures/path/to/album/mypicture.jpg
        Previews: /media/previews/path/to/album/mypicture/640x480q60.jpg
        """
        if self.is_original:
            base_dir = 'pictures'
            postfix = ''
        else:
            base_dir = 'previews'
            postfix = '/' + str(self.spec)

        # TODO hardcoded jpeg
        return "{prefix}{base_dir}{path}{postfix}.jpg".format(
            prefix=prefix,
            base_dir=base_dir,
            path=self.picture.path,
            postfix=postfix,
        )

    def get_absolute_uri(self):
        return self.src.url

    def get_absolute_fs_path(self):
        return self.src.path

    @contextmanager
    def as_image(self):
        image = Image.open(self.src.path)
        try:
            yield image
        finally:
            image.close()

    @classmethod
    def import_local_media(cls, picture, input_filename, mode='inplace', media_specs=None):
        if media_specs is None:
            media_specs = MediaSpec.objects.all()

        original_media, unused = cls.get_or_create_original_media(picture, input_filename, mode)

        for spec in media_specs:
            cls.get_or_create_scaled_media(original_media, spec)

    @classmethod
    def make_absolute_path_media_relative(cls, original_path):
        print(original_path)
        assert original_path.startswith(settings.MEDIA_ROOT)

        # make path relative to /media/
        original_path = original_path[len(settings.MEDIA_ROOT):]

        # remove leading slash
        if original_path.startswith('/'):
            original_path = original_path[1:]

        return original_path

    @classmethod
    def process_file_location(cls, original_media, input_filename, mode='inplace'):
        if mode == 'inplace':
            original_path = abspath(input_filename)
        elif mode in ('copy', 'move'):
            original_path = original_media.get_canonical_path()
            makedirs(dirname(original_path), exist_ok=True)

            if mode == 'copy':
                shutil.copyfile(input_filename, original_path)
            elif mode == 'move':
                shutil.move(input_filename, original_path)
            else:
                raise NotImplementedError(mode)
        else:
            raise NotImplementedError(mode)

        return cls.make_absolute_path_media_relative(original_path)

    @classmethod
    def get_or_create_original_media(cls, picture, input_filename, mode='inplace'):
        media, created = Media.objects.get_or_create(
            picture=picture,
            spec=None,
        )

        log_get_or_create(logger, media, created)

        src_missing = not media.src
        if src_missing:
            media.src = cls.process_file_location(media, input_filename, mode)
            media.save()

        log_get_or_create(logger, media.src, src_missing)

        return media, created

    @classmethod
    def get_or_create_scaled_media(cls, original_media, spec):
        assert original_media.is_original

        scaled_media, created = Media.objects.get_or_create(
            picture=original_media.picture,
            spec=spec,
        )

        log_get_or_create(logger, scaled_media, created)

        src_missing = not scaled_media.src
        if src_missing:
            makedirs(dirname(scaled_media.get_canonical_path()), exist_ok=True)
            with original_media.as_image() as image:
                image.thumbnail(spec.size)
                image.save(scaled_media.get_canonical_path(), 'JPEG', quality=scaled_media.spec.quality)

            scaled_media.src = scaled_media.get_canonical_path('')
            scaled_media.save()

        log_get_or_create(logger, scaled_media.src, src_missing)

        return scaled_media, created

    def __str__(self):
        return self.src.url if self.src else self.get_canonical_path('')

    class Meta:
        verbose_name = 'Media'
        verbose_name_plural = 'Media'
