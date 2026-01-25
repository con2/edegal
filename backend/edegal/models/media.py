from __future__ import annotations

import logging
from contextlib import contextmanager
from datetime import datetime
from os import makedirs
from os.path import abspath, dirname, getsize
from typing import TYPE_CHECKING

from django.conf import settings
from django.db import models
from django.utils.timezone import make_aware
from PIL import Image

from ..utils import log_get_or_create, pick_attrs
from .media_spec import FORMAT_CHOICES, ROLE_CHOICES, MediaSpec

if TYPE_CHECKING:
    from .picture import Picture

logger = logging.getLogger(__name__)


FORMAT_OPTIONS = dict(
    jpeg=dict(
        # progressive=True,
        optimize=True,
    ),
    webp=dict(
        method=6,
    ),
    avif=dict(),
)

ROLE_CHOICES = ROLE_CHOICES + [
    ("original", "Original"),
]

EXIF_DATETIME_ORIGINAL = 0x9003
EXIF_DATETIME_FORMAT = "%Y:%m:%d %H:%M:%S"


class Media(models.Model):
    picture = models.ForeignKey(
        "edegal.Picture", on_delete=models.CASCADE, related_name="media"
    )
    width = models.PositiveIntegerField(default=0)
    height = models.PositiveIntegerField(default=0)
    src = models.FileField(
        unique=True,
        max_length=1023,
    )
    spec: models.ForeignKey[MediaSpec | None] = models.ForeignKey(
        MediaSpec,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    role = models.CharField(
        max_length=max(len(ext) for (ext, label) in ROLE_CHOICES),
        choices=ROLE_CHOICES,
    )
    format = models.CharField(
        max_length=max(len(ext) for (ext, label) in FORMAT_CHOICES),
        default="jpeg",
    )

    def as_dict(self, additional_formats: list[str] = []):
        """
        :param additional_formats: the caller has determined what formats of the current
        """
        return pick_attrs(
            self,
            "width",
            "height",
            src=self.src.url,
            additional_formats=additional_formats,
        )

    @property
    def path(self):
        return self.src

    @property
    def file_size(self):
        try:
            return getsize(self.src.path)
        except RuntimeError:
            logger.exception("getsize failed: %s", self.src.path)
            return None

    def get_exif_datetime(self):
        with self.as_image() as image:
            try:
                exif = image._getexif()  # type: ignore
                dt = datetime.strptime(
                    exif[EXIF_DATETIME_ORIGINAL], EXIF_DATETIME_FORMAT
                )
                return make_aware(dt)
            except Exception:
                logger.debug(
                    "Failed to extract original datetime from EXIF for %s",
                    self,
                    exc_info=True,
                )
                return None

    def get_canonical_path(self, prefix=settings.MEDIA_ROOT + "/"):
        """
        Returns the canonical path of this medium. This is where the file would be stored
        unless in-place mode was used.

        Originals: /media/pictures/path/to/album/mypicture.jpeg
        Previews: /media/previews/path/to/album/mypicture.preview.jpeg
        Previews: /media/previews/path/to/album/mypicture.thumbnail.jpeg
        """
        if self.role == "original":
            base_dir = "pictures"
            postfix = ".jpeg"  # TODO hardcoded jpeg
        else:
            assert self.spec, "non-original media must have a spec"
            base_dir = "previews"
            postfix = f".{self.spec.role}.{self.spec.format}"

        # TODO hardcoded jpeg
        return f"{prefix}{base_dir}{self.picture.path}{postfix}"

    def get_absolute_uri(self):
        return self.src.url

    def get_absolute_fs_path(self):
        return self.src.path

    @contextmanager
    def as_image(self):
        if getattr(self, "_image", None):
            # nested
            assert self._image, "assert to remove |None from type (should never fire)"
            yield self._image
        else:
            # top-level
            self._image = Image.open(self.src.path)
            try:
                yield self._image
            finally:
                self._image.close()
                self._image = None

    @classmethod
    def import_local_media(
        cls,
        picture: Picture,
        input_filename: str,
        media_specs: models.QuerySet[MediaSpec] | None = None,
        refresh_album=False,
    ):
        if media_specs is None:
            media_specs = MediaSpec.objects.filter(active=True)

        if settings.EDEGAL_USE_CELERY:
            from ..tasks import import_local_media

            media_specs_ids = list(media_specs.values_list(flat=True))
            import_local_media.delay(
                picture.id, input_filename, media_specs_ids, refresh_album
            )  # type: ignore
        else:
            cls._import_local_media(picture, input_filename, media_specs, refresh_album)

    @classmethod
    def _import_local_media(
        cls,
        picture: Picture,
        input_filename: str,
        media_specs: models.QuerySet[MediaSpec],
        refresh_album: bool,
    ):
        original_media, unused = cls.get_or_create_original_media(
            picture, input_filename
        )

        for spec in media_specs:
            cls.get_or_create_scaled_media(original_media, spec)

        if refresh_album:
            picture.album.save()

    @classmethod
    def import_open_file(
        cls,
        picture: Picture,
        input_file,
        media_specs: models.QuerySet[MediaSpec] | None = None,
        refresh_album: bool = False,
    ):
        original_path = Media(picture=picture, role="original").get_canonical_path()
        makedirs(dirname(original_path), exist_ok=True)

        with open(original_path, "wb") as output_file:
            output_file.write(input_file.read())

        cls.import_local_media(
            picture,
            original_path,
            media_specs=media_specs,
            refresh_album=refresh_album,
        )

    @classmethod
    def get_relative_media_path(cls, original_path: str):
        original_path = abspath(original_path)

        if not original_path.startswith(settings.MEDIA_ROOT):
            raise ValueError(
                f"Original path {original_path} is not under MEDIA_ROOT {settings.MEDIA_ROOT}"
            )

        # make path relative to /media/
        original_path = original_path.removeprefix(settings.MEDIA_ROOT)

        # remove leading slash
        if original_path.startswith("/"):
            original_path = original_path[1:]

        return original_path

    @classmethod
    def get_or_create_original_media(cls, picture: Picture, input_filename: str):
        try:
            original_media = Media.objects.get(
                picture=picture,
                role="original",
            )

            created = False
        except Media.DoesNotExist:
            original_media = Media(
                picture=picture,
                role="original",
                format="jpeg",  # TODO hardcoded jpeg
            )

            original_media.src = cls.get_relative_media_path(input_filename)

            with original_media.as_image() as image:
                original_media.width, original_media.height = image.size
                picture.taken_at = original_media.get_exif_datetime()
                picture.save(update_fields=["taken_at"])

            original_media.save()

            created = True

        log_get_or_create(logger, original_media, created)
        return original_media, created

    @classmethod
    def get_or_create_scaled_media(cls, original_media: Media, spec: MediaSpec):
        assert original_media.role == "original"

        try:
            scaled_media = Media.objects.get(
                picture=original_media.picture,
                spec=spec,
            )

            created = False
        except Media.DoesNotExist:
            scaled_media = cls.create_scaled_media(original_media, spec)
            created = True

        log_get_or_create(logger, scaled_media, created)

        return scaled_media, created

    @classmethod
    def create_scaled_media(cls, original_media, spec):
        scaled_media = Media(
            picture=original_media.picture,
            spec=spec,
            role=spec.role,
            format=spec.format,
        )

        assert scaled_media.spec

        makedirs(dirname(scaled_media.get_canonical_path()), exist_ok=True)
        with original_media.as_image() as image:
            image.thumbnail(spec.size)
            image.save(
                scaled_media.get_canonical_path(),
                format=scaled_media.spec.format,
                quality=scaled_media.spec.quality,
                **FORMAT_OPTIONS[scaled_media.spec.format],
            )

            scaled_media.width, scaled_media.height = image.size

        scaled_media.src = scaled_media.get_canonical_path("")
        scaled_media.save()

        return scaled_media

    def __str__(self):
        return self.src.url if self.src else self.get_canonical_path("")

    class Meta:
        verbose_name = "Media"
        verbose_name_plural = "Media"
