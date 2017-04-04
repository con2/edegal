import logging

from django.db import models
from django.db.models import Q
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

    cover_picture = models.ForeignKey('Picture', null=True, blank=True, related_name='+')

    is_public = models.BooleanField(
        default=True,
        verbose_name=u'Julkinen',
        help_text=u'Ei-julkiset albumit näkyvät vain ylläpitokäyttäjille.',
    )

    def as_dict(self):
        return pick_attrs(self,
            'slug',
            'path',
            'title',
            'description',

            breadcrumb=[ancestor._make_breadcrumb() for ancestor in self.get_ancestors()],
            subalbums=[subalbum._make_subalbum() for subalbum in self.subalbums.all()],
            pictures=[picture.as_dict() for picture in self.pictures.all()],
            thumbnail=self._make_thumbnail(),
        )

    def _make_thumbnail(self):
        if self.cover_picture:
            return self.cover_picture.get_thumbnail().as_dict()
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
        q = Q(path=path) | Q(pictures__path=path)

        if extra_criteria:
            q &= Q(**extra_criteria)

        # FIXME In SQLite, this does a full table scan on gallery_album when the WHERE over the JOIN gallery_picture
        # is present. Need to check if this is the case on PostgreSQL, too.
        queryset = (
            cls.objects.filter(q)
            .distinct()
            .select_related('cover_picture')
            .prefetch_related('cover_picture__media')
            .prefetch_related('pictures')
            .prefetch_related('pictures__media')
            .prefetch_related('pictures__media__spec')
            .prefetch_related('subalbums')
            .prefetch_related('subalbums__cover_picture')
        )

        if or_404:
            return get_object_or_404(queryset)
        else:
            return queryset.get()

    def __str__(self):
        return self.path

    class Meta:
        verbose_name = 'Albumi'
        verbose_name_plural = 'Albumit'
        unique_together = [('parent', 'slug')]
