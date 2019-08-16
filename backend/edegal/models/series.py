import logging

from django.conf import settings
from django.db import models
from django.db.models import F

from ..utils import pick_attrs, slugify

from .album_mixin import AlbumMixin
from .common import CommonFields


logger = logging.getLogger(__name__)


class Series(AlbumMixin, models.Model):
    """
    A Series is a chronological series of albums.

    Consider, for example, a site that hosts pictures for lots of events that happen annually over the year.
    The same events of different years form a Series.

    This allows us to browse all events chronologically on the front page while also enabling us to browse
    occurrences of a specific event.

    The Series is made part of the breadcrumb navigation but not the URL. The rationale for this is that
    often events contain the year or an ordinal as part of their names (such as Tracon X, Desucon 2019 etc.)
    Having /desucon as the Series URL and /desucon-2019 as the Album URL saves space while remaining just as
    informative as /desucon/desucon-2019.
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
            credits={},
        )

    def get_albums(self, **extra_criteria):
        from .album import Album

        return (
            Album.objects.filter(series=self, **extra_criteria)
            .only('id', 'path', 'title', 'redirect_url', 'date', 'cover_picture')
            .select_related('cover_picture')
            .order_by(F('date').desc(nulls_last=True), 'tree_id')
        )

    def resequence(self):
        """
        Called during Album.save to update `previous_in_series` and `next_in_seriesà.
        """
        previous_album = None

        # iterated oldest first
        for album in self.get_albums().reverse():
            logger.debug('Setting predecessor (older) in series %s of %s to %s', self, album, previous_album)
            album.previous_in_series = previous_album

            if previous_album:
                logger.debug('Setting successor (newer) in series %s of %s to %s', self, previous_album, album)
                previous_album.next_in_series = album
                previous_album.save(traverse=False)

            previous_album = album

        if previous_album:
            logger.debug('Setting successor (newer) in series %s of %s to None', self, previous_album)
            previous_album.next_in_series = None
            previous_album.save(traverse=False)

    class Meta:
        verbose_name = 'Series'
        verbose_name_plural = 'Series'
