from django.conf import settings
from django.db import models

from .album_mixin import AlbumMixin
from .common import CommonFields
from ..utils import slugify, pick_attrs


class Photographer(AlbumMixin, models.Model):
    """
    Metadata used to give credit to the author(s) of a photo. While it's named Photographer, we use the
    same model for photographic directors, lighting designers etc.

    Try not to replicate anything already present on auth.User here.
    """
    slug = models.CharField(**CommonFields.slug)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    email = models.EmailField(
        blank=True,
        help_text=(
            'This e-mail address will be offered as a contact point for users who want to request permission to use '
            'your photos for purposes other than those covered by the terms and conditions.'
        ),
    )
    display_name = models.CharField(max_length=255, db_index=True)
    homepage_url = models.CharField(max_length=255, blank=True)
    twitter_handle = models.CharField(max_length=15, blank=True)
    instagram_handle = models.CharField(max_length=30, blank=True)
    facebook_handle = models.CharField(max_length=50, blank=True)
    default_terms_and_conditions = models.ForeignKey('edegal.TermsAndConditions', null=True, blank=True, on_delete=models.SET_NULL)

    cover_picture = models.ForeignKey('Picture',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    def save(self, *args, **kwargs):
        if not self.slug:
            if self.user and self.user.username:
                self.slug = self.user.username
            elif self.display_name:
                self.slug = slugify(self.display_name)

        if self.twitter_handle.startswith('@'):
            self.twitter_handle = self.twitter_handle[1:]
        if self.instagram_handle.startswith('@'):
            self.instagram_handle = self.instagram_handle[1:]
        if self.facebook_handle.startswith('@'):
            self.facebook_handle = self.facebook_handle[1:]

        return super().save(*args, **kwargs)

    def make_credit(self, **extra_attrs):
        return pick_attrs(self,
            'path',
            'display_name',
            'homepage_url',
            'twitter_handle',
            'instagram_handle',
            'facebook_handle',

            **extra_attrs,
        )

    def make_subalbum(self, format='jpeg'):
        return pick_attrs(self,
            'path',
            'title',
            redirect_url='',
            date='',
            thumbnail=self._make_thumbnail(format=format),
        )

    def make_album(self, format='jpeg'):
        """
        Returns an album-like dict representation of the Photographer.
        """
        from .album import Album

        return pick_attrs(self,
            'path',
            'title',
            body='',
            subalbums=[
                album.make_subalbum(format=format, context='photographer')
                for album in Album.get_albums(photographer=self, is_public=True, is_visible=True)
            ],
            pictures=[],
            breadcrumb=[
                Album.objects.get(path='/')._make_breadcrumb(),
                dict(path='/photographers', title='Photographers'),
            ],
            redirect_url='',
            is_downloadable=False,
            download_url='',
            date='',
            layout='yearly',
            credits=dict(
                photographer=self.make_credit(),
            ),
            cover_picture=(
                self.cover_picture.as_dict(
                    format=format,
                    include_credits=self.cover_picture.album.photographer != self,
                )
                if self.cover_picture
                else None
            ),
        )

    @property
    def path(self):
        return f'/photographers/{self.slug}'

    @property
    def title(self):
        return self.display_name

    class Meta:
        ordering = ('display_name',)
