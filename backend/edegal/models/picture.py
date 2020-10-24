import logging
from random import randint

from django.conf import settings
from django.db import models
from django.db.utils import ProgrammingError
from django.utils.translation import ugettext_lazy as _

from ..utils import slugify, pick_attrs
from .common import CommonFields
from .media_spec import MediaSpec


logger = logging.getLogger(__name__)


class Picture(models.Model):
    slug = models.CharField(**CommonFields.slug)
    album = models.ForeignKey('edegal.Album', related_name='pictures', on_delete=models.CASCADE)
    order = models.IntegerField(**CommonFields.order)
    path = models.CharField(**CommonFields.path)

    title = models.CharField(**CommonFields.title)
    description = models.TextField(**CommonFields.description)

    is_public = models.BooleanField(default=True)

    created_at = models.DateTimeField(null=True, auto_now_add=True)
    updated_at = models.DateTimeField(null=True, auto_now=True)
    taken_at = models.DateTimeField(null=True, blank=True, help_text="EXIF original date time of the original media")

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)

    @property
    def terms_and_conditions(self):
        if self.override_terms_and_conditions:
            return self.override_terms_and_conditions
        else:
            return self.album.terms_and_conditions

    def as_dict(self, format='jpeg', include_credits=False):
        result = pick_attrs(self,
            'path',
            'title',
            'description',
            'is_public',
            taken_at=self.taken_at.isoformat() if self.taken_at else '',
            thumbnail=self.get_media('thumbnail', format).as_dict(),
            preview=self.get_media('preview', format).as_dict(),
            original=self.get_media('original', format).as_dict(),
        )

        if include_credits:
            result['credits'] = self.make_credits()

        return result

    def make_credits(self):
        # TODO allow overriding photog per-picture
        return self.album.make_credits()

    def _make_path(self):
        assert self.album
        return self.album.path + '/' + self.slug

    def get_media(self, role, format='jpeg'):
        # do this client-side to support prefetch_related and reduce hits to database
        all_media = sorted(list(self.media.all()), key=lambda medium: -medium.width)
        role_matching_media = [medium for medium in all_media if medium.role == role]
        matching_media = [medium for medium in role_matching_media if medium.format == format]

        # progressively increasing desperation
        if matching_media:
            return matching_media[0]
        elif role_matching_media:
            return role_matching_media[0]
        else:
            return all_media[0]

    def refresh_media(self, dry_run=False):
        current_specs = MediaSpec.objects.filter(active=True)

        media_to_remove = self.media.all().exclude(role='original').exclude(spec__in=current_specs)

        assert dry_run, "actually doing this not implemented yet :)"

        for medium in media_to_remove:
            print('Would remove', medium)

    @classmethod
    def get_random_picture(cls):
        max_id = cls.objects.only('id').latest('id').id
        sample_id = randint(1, max_id)

        return cls.objects.filter(
            id__gte=sample_id,
            is_public=True,
            album__is_public=True,
            album__is_visible=True,
            album__redirect_url='',
        ).only('id', 'path').order_by('id').first()

    @property
    def original(self):
        if not hasattr(self, '_original'):
            self._original = next((media for media in self.media.all() if media.spec is None), None)

        return self._original

    @property
    def thumbnail(self):
        if not hasattr(self, '_thumbnail'):
            self._thumbnail = next((
                media
                for media in self.media.all()
                if media.spec and media.spec.is_default_thumbnail
            ), None)

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
        verbose_name = _('Picture')
        verbose_name_plural = _('Pictures')
        unique_together = [('album', 'slug')]
        ordering = ('album', 'order', 'taken_at', 'slug')
        index_together = [('album', 'order', 'slug')]
