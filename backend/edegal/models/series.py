from django.conf import settings
from django.db import models
from django.db.models import F

from ..utils import pick_attrs, slugify

from .album_mixin import AlbumMixin
from .common import CommonFields


class Series(AlbumMixin, models.Model):
    """
    A Series is a chronological series of albums.

    Consider, for example, a site that hosts pictures for lots of events that happen annually over the year.
    The same events of different years form a Series.
    """
    title = models.CharField(**CommonFields.title)
    slug = models.CharField(**CommonFields.slug)
    description = models.TextField(**CommonFields.description)
    body = models.TextField(**CommonFields.body)

    is_public = models.BooleanField(**CommonFields.is_public)
    is_visible = models.BooleanField(**CommonFields.is_visible)

    # denormalized
    path = models.CharField(**CommonFields.path)

    # automatic
    created_at = models.DateTimeField(null=True, blank=True, auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True, auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, null=True, on_delete=models.SET_NULL)

    def save(self, *args, **kwargs):
        if self.title and not self.slug:
            self.slug = slugify(self.title)

        if self.slug and not self.path:
            self.path = f'/{self.slug}'

        return super().save(*args, **kwargs)

    def as_dict(self, include_hidden=False, format='jpeg'):
        from .album import Album

        child_criteria = dict()
        if not include_hidden:
            child_criteria.update(is_public=True, is_visible=True)

        return pick_attrs(self,
            'slug',
            'path',
            'title',
            'description',
            'body',

            redirect_url='',
            layout='simple',
            date=None,
            breadcrumb=[
                Album.objects.get(path='/')._make_breadcrumb(),
            ],
            subalbums=[
                album._make_subalbum(format=format)
                for album in self.get_albums(**child_criteria)
            ],
            pictures=[],
            terms_and_conditions=None,
        )

    def get_albums(self, **extra_criteria):
        from .album import Album

        return (
            Album.objects.filter(series=self, **extra_criteria)
            .only('id', 'path', 'title', 'redirect_url', 'date', 'cover_picture')
            .select_related('cover_picture')
            .order_by(F('date').desc(nulls_last=True), 'tree_id')
        )

    class Meta:
        verbose_name = 'Series'
        verbose_name_plural = 'Series'
