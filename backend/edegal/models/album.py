import logging
import re
import os
from datetime import date
from zipfile import ZipFile

from django.conf import settings
from django.db import models
from django.db.models import F
from django.shortcuts import get_object_or_404

from mptt.models import MPTTModel, TreeForeignKey

from ..utils import slugify, pick_attrs, strip_photographer_name_from_title

from .album_mixin import AlbumMixin
from .common import CommonFields
from .picture import Picture
from .series import Series


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

BREADCRUMB_SEPARATOR = " » "

FAKE_ALBUM_DEFAULTS = dict(
    # path must be provided
    title='',
    body='',
    subalbums=[],
    pictures=[],
    redirect_url='',
    is_downloadable=False,
    download_url='',
    date='',
    layout='simple',
    credits={},
)


class Album(AlbumMixin, MPTTModel):
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

    body = models.TextField(**CommonFields.body)

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
    is_downloadable = models.BooleanField(default=True, help_text=(
        'Controls whether or not site visitors can download original photos from this album, or the whole album as a zip file.'
    ))

    photographer = models.ForeignKey('edegal.Photographer', null=True, blank=True, on_delete=models.SET_NULL, related_name='albums')
    director = models.ForeignKey(
        'edegal.Photographer',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='directed_albums',
    )
    terms_and_conditions = models.ForeignKey('edegal.TermsAndConditions', null=True, blank=True, on_delete=models.SET_NULL)

    date = models.DateField(
        null=True,
        help_text=(
            'When did the events portrayed in this album happen? '
            'Note that this may differ from album creation date which is tracked automatically.'
        ),
    )

    created_at = models.DateTimeField(null=True, blank=True, auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True, auto_now=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, null=True, on_delete=models.SET_NULL)

    series = models.ForeignKey('edegal.Series', blank=True, null=True, on_delete=models.SET_NULL, related_name='albums')

    # denormalized from `series`
    previous_in_series = models.ForeignKey('self', blank=True, null=True, on_delete=models.SET_NULL, related_name='+')
    next_in_series = models.ForeignKey('self', blank=True, null=True, on_delete=models.SET_NULL, related_name='+')

    def __init__(self, *args, **kwargs):
        super(Album, self).__init__(*args, **kwargs)
        self.__original_path = self.path

    def as_dict(self, include_hidden=False, format='jpeg'):
        if include_hidden:
            subalbums = self._get_subalbums()
            pictures = self._get_pictures()
        else:
            subalbums = self._get_subalbums(is_public=True, is_visible=True)
            pictures = self._get_pictures(is_public=True)

        return pick_attrs(self,
            'slug',
            'path',
            'title',
            'description',
            'body',
            'redirect_url',
            'layout',
            'is_downloadable',

            is_public=self.is_public and self.is_visible,
            cover_picture=(
                self.cover_picture.as_dict(format=format)
                if self.cover_picture
                else None
            ),
            credits=self.make_credits(),
            date=self.date.isoformat() if self.date else '',
            breadcrumb=self._make_breadcrumbs(),
            download_url=self.download_url or '',
            subalbums=[subalbum.make_subalbum(format=format) for subalbum in subalbums],
            pictures=[picture.as_dict(format=format) for picture in pictures],
            terms_and_conditions=(
                self.terms_and_conditions.as_dict()
                if self.terms_and_conditions
                else None
            ),
            previous_in_series=(
                self.previous_in_series._make_breadcrumb()
                if self.previous_in_series
                else None
            ),
            next_in_series=(
                self.next_in_series._make_breadcrumb()
                if self.next_in_series
                else None
            ),
        )

    @classmethod
    def fake_album_as_dict(self, *, path, **kwargs):
        """
        Many of our views are implemented as returning Album-like JSON objects.
        Use this method for getting sensible defaults for omitted fields.
        """
        result = dict(FAKE_ALBUM_DEFAULTS, path=path, **kwargs)

        if 'breadcrumb' not in result:
            result['breadcrumb'] = [
                Album.objects.get(path='/')._make_breadcrumb(),
            ]

        return result

    def _get_subalbums(self, **subalbum_criteria):
        return self.get_albums(parent=self, **subalbum_criteria)

    @classmethod
    def get_albums(cls, **criteria):
        return (
            cls.objects.filter(cover_picture__media__role='thumbnail', **criteria)
            .only('id', 'path', 'title', 'redirect_url', 'date', 'cover_picture', 'is_public', 'is_visible')
            .distinct()
            .select_related('cover_picture')
            .order_by(F('date').desc(nulls_last=True), 'tree_id')
        )

    def _get_pictures(self, **subalbum_criteria):
        return (
            self.pictures.filter(media__role='thumbnail', **subalbum_criteria)
                .distinct()
                .prefetch_related('media')
        )

    def make_subalbum(self, format='jpeg', context='parent'):
        if context == 'parent':
            return pick_attrs(self,
                'path',
                'title',
                'redirect_url',
                is_public=self.is_public and self.is_visible,
                date=self.date.isoformat() if self.date else '',
                thumbnail=self._make_thumbnail(format=format),
            )
        elif context == 'photographer':
            return pick_attrs(self,
                'path',
                'redirect_url',
                is_public=self.is_public and self.is_visible,
                title=self.title_in_photographer_context,
                date=self.date.isoformat() if self.date else '',
                thumbnail=self._make_thumbnail(format=format),
            )
        else:
            raise NotImplementedError(context)

    @property
    def title_in_photographer_context(self):
        parts = []

        for breadcrumb in self.get_ancestors(include_self=True).only('title', 'path'):
            if breadcrumb.path == '/':
                # No need to have the gallery title here
                continue

            title = breadcrumb.title

            if self.photographer and self.photographer.display_name:
                title = strip_photographer_name_from_title(title, self.photographer.display_name)

            if title:
                parts.append(title)

        if parts:
            return BREADCRUMB_SEPARATOR.join(parts)
        else:
            # oopsie woopsie
            return self.title

    def _make_path(self):
        if self.parent is None:
            return '/'
        else:
            # XX ugly
            pth = self.parent.path + '/' + self.slug
            if pth.startswith('//'):
                pth = pth[1:]
            return pth

    def _make_breadcrumbs(self):
        ancestors = self.get_ancestors().only('path', 'title', 'series')
        series = self.series or next((album.series for album in ancestors if album.series), None)
        breadcrumbs = [ancestor._make_breadcrumb() for ancestor in ancestors]

        if series:
            breadcrumbs.insert(1, series._make_breadcrumb())

        return breadcrumbs

    def make_credits(self):
        credits = {}

        if self.photographer:
            credits['photographer'] = self.photographer.make_credit()
        if self.director:
            credits['director'] = self.director.make_credit()

        return credits

    def _select_cover_picture(self):
        first_subalbum = self.subalbums.filter(cover_picture__media__role='thumbnail').first()
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
        3. Non-root ancestors

        Description is preferred to title because some events might have a fictional date in their title.
        """
        # 1. Cover picture EXIF data
        try:
            d = self.cover_picture.original.get_exif_datetime().date()
            logger.debug('Guessed date %s from cover picture EXIF for %s', d.isoformat(), self)
            return d
        except (RuntimeError, LookupError, TypeError, ValueError, AttributeError):
            logger.warning('Failed to guess date from cover picture EXIF for %s', self)

        # 2. Known date formats in description or title
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

        # 3. Non-root ancestors, nearest first
        ancestor_with_date = (
            self.get_ancestors(ascending=True, include_self=False)
            .exclude(path='/')
            .filter(date__isnull=False)
            .first()
        )
        if ancestor_with_date:
            logger.debug('Guessed date %s from ancestry (%s)', ancestor_with_date.date.isoformat(), ancestor_with_date.path)
            return ancestor_with_date.date

        logger.warning('No method of date guessing worked for %s', self)

    def save(self, *args, **kwargs):
        """
        One extra keyword argument is supported: `traverse` controls whether any changes
        that affect other albums as well should be propagated.

        The default for `traverse` is True. However, when `Album.save(traverse=True)` saves other
        albums, those saves are done `save=False` in order to stop recursion.
        """
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

        return_value = super().save(*args, **kwargs)

        # _guess_date calls get_ancestors, so must be done after first save
        if not self.date:
            self.date = self._guess_date()
            if self.date:
                super().save(*args, **kwargs)

        # In case path changed, update child pictures' paths.
        for picture in self.pictures.all():
            picture.save()

        if traverse:
            self._update_family(path_changed)

            if self.series:
                self.series.resequence()

        return return_value

    def _update_family(self, path_changed):
        """
        Called during `Album.save(traverse=True)` to update dependent Albums.

        If the `path` field is unchanged, it suffices to update any albums *above* this one
        in order to propagate `cover_picture` changes.

        If the `path` field is changed, we also need to update any albums *below* this one
        because their path is dependent on ours.
        """
        if path_changed:
            family = self.get_family()
        else:
            family = self.get_ancestors()

        for album in family:
            # Cannot use identity or id because self might not be saved yet!
            if album.path != self.path:
                logger.debug('Album.save(traverse=True) visiting {path}'.format(path=album.path))
                album.save(traverse=False)

    @classmethod
    def get_album_by_path(cls, path, or_404=False, **extra_criteria):
        # Is it a Series?
        try:
            return Series.objects.get(path=path)
        except Series.DoesNotExist:
            pass

        # Is it a Picture?
        try:
            picture = Picture.objects.only('album_id').get(path=path)
        except Picture.DoesNotExist:
            query = dict(path=path, **extra_criteria)
        else:
            query = dict(id=picture.album_id, **extra_criteria)

        # TODO Can we limit fetched fields in select_related?
        queryset = (
            cls.objects.filter(**query)
            .distinct()
            .select_related(
                'previous_in_series',
                'next_in_series',
                'photographer',
                'director',
                'terms_and_conditions',
            )
            .prefetch_related('cover_picture__media')
        )

        if or_404:
            return get_object_or_404(queryset)
        else:
            return queryset.get()

    def get_download_file_path(self, prefix=settings.MEDIA_ROOT + '/'):
        return f'{prefix}downloads{self.path}.zip'

    @property
    def is_download_ready(self):
        return os.path.exists(self.get_download_file_path())

    @property
    def download_url(self):
        if self.is_download_ready:
            return self.get_download_file_path(prefix='/media/')
        else:
            return None

    @property
    def readme_file_content(self):
        lines = [
            self.title,
            self.get_absolute_url(),
            '',
        ]

        if self.photographer:
            lines.append(f'Photographer: {self.photographer.display_name}')
            if self.photographer.twitter_handle:
                lines.append(f'Twitter: @{self.photographer.twitter_handle}')
            if self.photographer.instagram_handle:
                lines.append(f'Instagram: @{self.photographer.instagram_handle}')
            lines.append('')

        if self.director:
            lines.append(f'Director: {self.director.display_name}')
            if self.director.twitter_handle:
                lines.append(f'Twitter: @{self.director.twitter_handle}')
            if self.director.instagram_handle:
                lines.append(f'Instagram: @{self.director.instagram_handle}')
            lines.append('')

        if self.description:
            lines.extend((self.description, ''))

        if self.terms_and_conditions:
            lines.extend((self.terms_and_conditions.text, ''))

            if self.terms_and_conditions.url:
                lines.extend((self.terms_and_conditions.url, ''))

        return '\n'.join(lines).strip() + '\n'

    def ensure_download(self):
        if not self.is_download_ready:
            from ..tasks import album_ensure_download
            album_ensure_download.delay(self.id)

    def _ensure_download(self):
        if not self.is_downloadable:
            logger.warn('Tried to Album._ensure_download an undownloadable album %s', self)
            return
        if self.is_download_ready:
            logger.warn('Album._ensure_download %s called while download file already exists', self)
            return

        zip_file_path = self.get_download_file_path()
        zip_file_dir = os.path.dirname(zip_file_path)
        zip_file_basename = os.path.basename(zip_file_path)

        # Won't use NamedTemporaryFile etc. because we will be moving into place so need an actual file
        # on the same FS as the final file. Also conveniently locks this album so that no two processes
        # will try to generate the same file at the same time (ZipFile(mode='x') will error on collision).
        # Our slugs do not contain underscores so no collision danger there.
        temp_file_basename = f'_{zip_file_basename}'
        temp_file_path = os.path.join(zip_file_dir, temp_file_basename)

        logger.info('Creating zip file into temporary path %s', temp_file_path)

        os.makedirs(os.path.dirname(zip_file_path), exist_ok=True)

        try:
            with ZipFile(temp_file_path, 'x') as zip_file:
                with zip_file.open('README.txt', 'w') as readme_file:
                    logger.info('Writing README.txt')
                    readme_file.write(self.readme_file_content.encode('UTF-8'))

                for picture in self.pictures.filter(is_public=True):
                    original = picture.original
                    if not original:
                        logger.warn('Not adding %s to zip because it has no original media', self, picture)
                        continue

                    picture_file_name = f'{picture.slug}.jpg'
                    logger.info('Writing %s', picture_file_name)
                    with zip_file.open(picture_file_name, 'w') as zip_picture_file:
                        with original.open() as original_picture_file:
                            zip_picture_file.write(original_picture_file.read())
        except Exception:
            try:
                logger.exception('Creating zip file failed. Trying to delete temporary file.')
                os.unlink(temp_file_path)
            except Exception:
                logger.exception('Removing temp file failed.')

            raise

        os.rename(temp_file_path, zip_file_path)
        logger.info('Successfully created zip file %s', zip_file_path)

    class Meta:
        verbose_name = 'Album'
        verbose_name_plural = 'Albums'
        unique_together = [('parent', 'slug')]
