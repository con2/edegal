from django.db import models
from django.utils.translation import ugettext_lazy as _

from ..utils import slugify, pick_attrs
from .common import CommonFields


class Picture(models.Model):
    slug = models.CharField(**CommonFields.slug)
    album = models.ForeignKey('edegal.Album', related_name='pictures')
    order = models.IntegerField(**CommonFields.order)
    path = models.CharField(**CommonFields.path)

    title = models.CharField(**CommonFields.title)
    description = models.TextField(**CommonFields.description)

    @property
    def terms_and_conditions(self):
        if self.override_terms_and_conditions:
            return self.override_terms_and_conditions
        else:
            return self.album.terms_and_conditions

    def as_dict(self):
        return pick_attrs(self,
            'path',
            'title',
            'description',
            media=[medium.as_dict() for medium in self.media.all()],
        )

    def _make_path(self):
        assert self.album
        return self.album.path + '/' + self.slug

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
        ordering = ('album', 'order')
