import logging
import re
from datetime import date

from django.conf import settings
from django.db import models
from django.db.models import F
from django.shortcuts import get_object_or_404

from mptt.models import MPTTModel, TreeForeignKey

from ..utils import slugify, pick_attrs
from .common import CommonFields


logger = logging.getLogger(__name__)

# Presets for Album._guess_date.
# Could use datetime.strptime(…).date, but then would have to spell the same thing twice as we do not know
# at which point in title/description the date is present (if at all).
YEAR = r'(?P<year>\d{4})'
MONTH = r'(?P<month>[01]?\d)'
DAY = r'(?P<day>[0-3]?\d)'
GUESS_DATE_REGEXEN = (
    # ISO format
    re.compile(f'{YEAR}-{MONTH}-{DAY}'),

    # Finnish format
    re.compile(f'{DAY}.{MONTH}.{YEAR}'),

    # Not supporting slashful formats because the order can be anything (Y/D/M, Y/M/D, M/D/Y, D/M/Y…)
)

LAYOUT_CHOICES = [
    ('simple', 'Simple'),
    ('yearly', 'Yearly'),
]


class Album(MPTTModel):
    slug = models.CharField(**CommonFields.slug)
    parent = TreeForeignKey('self',
        null=True,
        blank=True,
        related_name='subalbums',
        db_index=True,
        verbose_name='Parent Album',
        help_text='The album under which this album will reside. The root album (/) has no parent album.'
    )
    path = models.CharField(**CommonFields.path)

    title = models.CharField(**CommonFields.title)
    description = models.TextField(**CommonFields.description)

    body = models.TextField(
        blank=True,
        default='',
        verbose_name='Text content',
        help_text='Will be displayed at the top of the album view before subalbums and pictures.',
    )

    redirect_url = models.CharField(
        max_length=1023,
        blank=True,
        verbose_name='Redirect URL',
        help_text='If set, users that stumble upon this album will be redirected to this URL.',
    )

    layout = models.CharField(
        max_length=max(len(key) for (key, label) in LAYOUT_CHOICES),
        default=LAYOUT_CHOICES[0][0],
        choices=LAYOUT_CHOICES,
    )

    cover_picture = models.ForeignKey('Picture',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    is_public = models.BooleanField(**CommonFields.is_public)
    is_visible = models.BooleanField(**CommonFields.is_visible)

    terms_and_conditions = models.ForeignKey('edegal.TermsAndConditions',
        null=True,
        blank=True,
    )

    date = models.DateField(null=True)

    created_at = models.DateTimeField(null=True, auto_now_add=True)
    updated_at = models.DateTimeField(null=True, auto_now=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True)

    def __init__(self, *args, **kwargs):
        super(Album, self).__init__(*args, **kwargs)
        self.__original_path = self.path

    def as_dict(self, include_hidden=False, format='jpeg'):
        child_criteria = dict()
        if not include_hidden:
            child_criteria.update(is_public=True)

        return pick_attrs(self,
            'slug',
            'path',
            'title',
            'description',
            'body',
            'redirect_url',
            'layout',

            date=self.date.isoformat() if self.date else '',
            breadcrumb=[ancestor._make_breadcrumb() for ancestor in self.get_ancestors()],
            subalbums=[
                subalbum._make_subalbum(format=format)
                for subalbum in self._get_subalbums(is_visible=True, **child_criteria)
            ],
            pictures=[
                picture.as_dict(format=format)
                for picture in self.pictures.filter(**child_criteria).prefetch_related('media')
            ],
            terms_and_conditions=(
                self.terms_and_conditions.as_dict()
                if self.terms_and_conditions
                else None
            ),
        )

    def _get_subalbums(self, **child_criteria):
        return (
            self.subalbums.filter(**child_criteria)
                .only('id', 'path', 'title', 'redirect_url', 'date', 'cover_picture')
                .select_related('cover_picture')
                .order_by(F('date').desc(nulls_last=True), 'tree_id')
        )

    def _make_subalbum(self, format):
        return pick_attrs(self,
            'path',
            'title',
            'redirect_url',
            date=self.date.isoformat() if self.date else '',
            thumbnail=self._make_thumbnail(format=format),
        )

    def _make_thumbnail(self, format):
        # TODO what if the thumbnail is hidden?
        if self.cover_picture:
            return self.cover_picture.get_media('thumbnail', format=format).as_dict()
        else:
            return None

    def _make_breadcrumb(self):
        return pick_attrs(self,
            'path',
            'title',
        )

    def _make_path(self):
        if self.parent is None:
            return '/'
        else:
            # XX ugly
            pth = self.parent.path + '/' + self.slug
            if pth.startswith('//'):
                pth = pth[1:]
            return pth

    def _select_cover_picture(self):
        first_subalbum = self.subalbums.filter(cover_picture__isnull=False).first()
        if first_subalbum is not None:
            return first_subalbum.cover_picture

        first_picture = self.pictures.first()
        if first_picture is not None:
            return first_picture

        return None

    def _guess_date(self):
        """
        Tries to guess a date for the album from the following sources:

        1. Cover picture EXIF data
        2. Known date formats in description or title

        Description is preferred to title because some events might have a fictional date in their title.
        """
        try:
            d = self.cover_picture.original.get_exif_datetime().date()
            logger.debug('Guessed date %s from cover picture EXIF for %s', d.isoformat(), self)
            return d
        except (RuntimeError, LookupError, TypeError, ValueError, AttributeError):
            logger.warning('Failed to guess date from cover picture EXIF for %s', self)

        for regex in GUESS_DATE_REGEXEN:
            match = regex.search(self.description) or regex.search(self.title)
            if match:
                try:
                    d = date(int(match.group('year')), int(match.group('month')), int(match.group('day')))
                except (ValueError, TypeError):
                    logger.warning(
                        'The format was good but the data was bad (year=%s, month=%s, day=%s)',
                        match.group('year'), match.group('month'), match.group('day'),
                    )
                else:
                    logger.debug('Guessed date %s from description/title for %s', d.isoformat(), self)
                    return d

        logger.warning('No method of date guessing worked for %s', self)

    def save(self, *args, **kwargs):
        traverse = kwargs.pop('traverse', True)

        if self.title and not self.slug:
            if self.parent:
                self.slug = slugify(self.title)
            else:
                self.slug = '-root-album'

        path_changed = False
        if self.slug:
            self.path = self._make_path()
            path_changed = self.path != self.__original_path

        if not self.cover_picture:
            self.cover_picture = self._select_cover_picture()

        if not self.date:
            self.date = self._guess_date()

        return_value = super(Album, self).save(*args, **kwargs)

        # In case path changed, update child pictures' paths.
        for picture in self.pictures.all():
            picture.save()

        # In case thumbnails or path changed, update whole family with updated information.
        if traverse:
            if path_changed:
                family = self.get_family()
            else:
                family = self.get_ancestors()

            for album in family:
                # Cannot use identity or id because self might not be saved yet!
                if album.path != self.path:
                    logger.debug('Album.save(traverse=True) visiting {path}'.format(path=album.path))
                    album.save(traverse=False)

        return return_value

    @classmethod
    def get_album_by_path(cls, path, or_404=False, **extra_criteria):
        # Is it a picture?
        from .picture import Picture
        try:
            picture = Picture.objects.only('album_id').get(path=path)
        except Picture.DoesNotExist:
            query = dict(path=path, **extra_criteria)
        else:
            query = dict(id=picture.album_id, **extra_criteria)

        queryset = (
            cls.objects.filter(**query)
            .distinct()
            .select_related('terms_and_conditions')
            .prefetch_related('cover_picture__media')
        )

        if or_404:
            return get_object_or_404(queryset)
        else:
            return queryset.get()

    def __str__(self):
        return self.path

    def get_absolute_url(self):
        return f'{settings.EDEGAL_FRONTEND_URL}{self.path}'

    class Meta:
        verbose_name = 'Album'
        verbose_name_plural = 'Albums'
        unique_together = [('parent', 'slug')]
