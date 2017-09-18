import logging

from django.conf import settings
from django.db import models
from django.shortcuts import get_object_or_404

from mptt.models import MPTTModel, TreeForeignKey

from ..utils import slugify, pick_attrs
from .common import CommonFields


logger = logging.getLogger(__name__)


class Album(MPTTModel):
    slug = models.CharField(**CommonFields.slug)
    parent = TreeForeignKey('self',
        null=True,
        blank=True,
        related_name='subalbums',
        db_index=True,
        verbose_name='Yläalbumi',
        help_text='Tämä albumi luodaan valitun albumin alaisuuteen. Juurialbumilla ei ole yläalbumia.'
    )
    path = models.CharField(**CommonFields.path)

    title = models.CharField(**CommonFields.title)
    description = models.TextField(**CommonFields.description)

    cover_picture = models.ForeignKey('Picture',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    is_public = models.BooleanField(**CommonFields.is_public)

    terms_and_conditions = models.ForeignKey('edegal.TermsAndConditions',
        null=True,
        blank=True,
    )

    def as_dict(self, include_hidden=False):
        child_criteria = dict()
        if not include_hidden:
            child_criteria.update(is_public=True)

        return pick_attrs(self,
            'slug',
            'path',
            'title',
            'description',

            breadcrumb=[ancestor._make_breadcrumb() for ancestor in self.get_ancestors()],
            subalbums=[subalbum._make_subalbum() for subalbum in self.subalbums.filter(**child_criteria)],
            pictures=[picture.as_dict() for picture in self.pictures.filter(**child_criteria)],
            thumbnail=self._make_thumbnail(),
            terms_and_conditions=(
                self.terms_and_conditions.as_dict()
                if self.terms_and_conditions
                else None
            ),
        )

    def _make_thumbnail(self):
        # TODO what if the thumbnail is hidden?

        if self.cover_picture:
            return self.cover_picture.thumbnail.as_dict()
        else:
            return None

    def _make_breadcrumb(self):
        return pick_attrs(self,
            'path',
            'title',
        )

    def _make_subalbum(self):
        return pick_attrs(self,
            'path',
            'title',
            thumbnail=self._make_thumbnail(),
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

    def save(self, *args, **kwargs):
        traverse = kwargs.pop('traverse', True)

        if self.title and not self.slug:
            if self.parent:
                self.slug = slugify(self.title)
            else:
                self.slug = '-root-album'

        if self.slug:
            self.path = self._make_path()

        if self.cover_picture is None:
            self.cover_picture = self._select_cover_picture()

        return_value = super(Album, self).save(*args, **kwargs)

        # In case path changed, update child pictures' paths.
        for picture in self.pictures.all():
            picture.save()

        # In case thumbnails or path changed, update whole family with updated information.
        if traverse:
            for album in self.get_family():

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
            .prefetch_related('pictures__media__spec')
            .prefetch_related('subalbums__cover_picture')
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
        verbose_name = 'Albumi'
        verbose_name_plural = 'Albumit'
        unique_together = [('parent', 'slug')]
