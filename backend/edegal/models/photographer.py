from django.conf import settings
from django.db import models

from .common import CommonFields
from ..utils import slugify, pick_attrs


class Photographer(models.Model):
    """
    Metadata used to give credit to the author(s) of a photo. While it's named Photographer, we use the
    same model for photographic directors, lighting designers etc.

    Try not to replicate anything already present on auth.User here.
    """
    slug = models.CharField(**CommonFields.slug)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    display_name = models.CharField(max_length=255, db_index=True)
    homepage_url = models.CharField(max_length=255, blank=True)
    twitter_handle = models.CharField(max_length=15, blank=True)
    instagram_handle = models.CharField(max_length=30, blank=True)
    facebook_handle = models.CharField(max_length=50, blank=True)
    default_terms_and_conditions = models.ForeignKey('edegal.TermsAndConditions', null=True, blank=True, on_delete=models.SET_NULL)

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

    def as_dict(self, **extra_attrs):
        return pick_attrs(self,
            'slug',
            'display_name',
            'homepage_url',
            'twitter_handle',
            'instagram_handle',
            'facebook_handle',

            **extra_attrs,
        )

    def __str__(self):
        return self.display_name

    class Meta:
        ordering = ('display_name',)
