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

    def as_dict(self):
        return pick_attrs(self,
            'path',
            'title',
            'description',
            media=[medium.as_dict() for medium in self.media.all()],
            thumbnail=self.get_thumbnail().as_dict(),
        )

    def _make_path(self):
        assert self.album
        return self.album.path + '/' + self.slug

    def get_original(self):
        return self.media.get(spec=None)

    def get_thumbnail(self):
        return self.media.get(spec__is_default_thumbnail=True)

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
