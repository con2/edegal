import logging
from random import randint
from typing import Any

from django.conf import settings
from django.db import models
from django.db.utils import ProgrammingError
from django.utils.translation import gettext_lazy as _

from ..utils import pick_attrs, slugify
from .common import CommonFields
from .media_spec import DEFAULT_FORMAT, MediaSpec

logger = logging.getLogger(__name__)


class Picture(models.Model):
    # TODO Reverse manager types?
    media: Any

    slug = models.CharField(**CommonFields.slug)
    album = models.ForeignKey(
        "edegal.Album",
        related_name="pictures",
        on_delete=models.CASCADE,
        db_index=False,  # have "fat" indexes on album, slug etc.
    )
    order = models.IntegerField(**CommonFields.order)
    path = models.CharField(**CommonFields.path)

    title = models.CharField(**CommonFields.title)
    description = models.TextField(**CommonFields.description)

    is_public = models.BooleanField(default=True)

    created_at = models.DateTimeField(null=True, auto_now_add=True)
    updated_at = models.DateTimeField(null=True, auto_now=True)
    taken_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="EXIF original date time of the original media",
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL
    )

    def as_dict(self, include_credits=False):
        result = pick_attrs(
            self,
            "path",
            "title",
            "description",
            "is_public",
            taken_at=self.taken_at.isoformat() if self.taken_at else "",
            thumbnail=self.get_media_dict("thumbnail"),
            preview=self.get_media_dict("preview"),
            original=self.get_media_dict("original"),
        )

        if include_credits:
            result["credits"] = self.make_credits()

        return result

    def make_credits(self):
        # TODO allow overriding photog per-picture
        return self.album.make_credits()

    def _make_path(self):
        assert self.album
        return self.album.path + "/" + self.slug

    def get_media_dict(self, role: str):
        # do this client-side to support prefetch_related and reduce hits to database
        all_media = sorted(list(self.media.all()), key=lambda medium: -medium.width)
        if not all_media:
            return {}

        base_media_item = next(
            (
                media_item
                for media_item in all_media
                if media_item.role == role and media_item.format == DEFAULT_FORMAT
            ),
            all_media[0],
        )
        additional_media = [
            media_item
            for media_item in all_media
            if media_item.role == role and media_item.format != base_media_item.format
        ]
        additional_formats = list(
            {media_item.format for media_item in additional_media}
        )

        # hack: avif precedes webp in alphabetical order
        additional_formats.sort()

        return base_media_item.as_dict(additional_formats=additional_formats)

    def refresh_media(self, dry_run=False):
        current_specs = MediaSpec.objects.filter(active=True)

        media_to_remove = (
            self.media.all().exclude(role="original").exclude(spec__in=current_specs)
        )

        assert dry_run, "actually doing this not implemented yet :)"

        for medium in media_to_remove:
            print("Would remove", medium)

    @classmethod
    def get_random_picture(cls):
        max_id = cls.objects.only("id").latest("id").id
        sample_id = randint(1, max_id)

        return (
            cls.objects.filter(
                id__gte=sample_id,
                is_public=True,
                album__is_public=True,
                album__is_visible=True,
                album__redirect_url="",
            )
            .only("id", "path")
            .order_by("id")
            .first()
        )

    @property
    def original(self):
        if not hasattr(self, "_original"):
            self._original = next(
                (media for media in self.media.all() if media.spec is None), None
            )

        return self._original

    @property
    def thumbnail(self):
        if not hasattr(self, "_thumbnail"):
            self._thumbnail = next(
                (
                    media
                    for media in self.media.all()
                    if media.spec and media.spec.is_default_thumbnail
                ),
                None,
            )

        return self._thumbnail

    def save(self, *args, **kwargs):
        if self.title and not self.slug:
            self.slug = slugify(self.title)

        if self.slug:
            self.path = self._make_path()

        return super(Picture, self).save(*args, **kwargs)

    def __str__(self):
        return self.path

    class Meta:
        verbose_name = _("Picture")
        verbose_name_plural = _("Pictures")
        unique_together = [("album", "slug")]
        ordering = ("album", "order", "taken_at", "slug")
        indexes = [
            models.Index(fields=["album", "order", "taken_at", "slug"]),
        ]
