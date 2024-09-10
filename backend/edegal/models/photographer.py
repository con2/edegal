from typing import Any

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.db import models

from ..utils import pick_attrs, slugify
from .album_mixin import AlbumMixin
from .common import CommonFields, make_body_field


class Photographer(AlbumMixin, models.Model):
    """
    Metadata used to give credit to the author(s) of a photo. While it's named Photographer, we use the
    same model for photographic directors, lighting designers etc.

    Try not to replicate anything already present on auth.User here.
    """

    # TODO
    cover_picture_id: int
    larppikuvat_profile: Any

    slug = models.CharField(**CommonFields.slug)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    email = models.EmailField(
        blank=True,
        help_text=(
            "This e-mail address will be offered as a contact point for users who want to request permission to use "
            "your photos for purposes other than those covered by the terms and conditions."
        ),
    )
    display_name = models.CharField(max_length=255, db_index=True)
    homepage_url = models.CharField(max_length=255, blank=True)
    twitter_handle = models.CharField(max_length=15, blank=True)
    instagram_handle = models.CharField(max_length=30, blank=True)
    facebook_handle = models.CharField(max_length=50, blank=True)
    flickr_handle = models.CharField(max_length=50, blank=True)
    default_terms_and_conditions = models.ForeignKey(
        "edegal.TermsAndConditions", null=True, blank=True, on_delete=models.SET_NULL
    )
    body = make_body_field(
        verbose_name="Introduction text",
        help_text="Will be displayed at the top of the photographer view before albums.",
    )

    cover_picture = models.ForeignKey(
        "Picture",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )

    def save(self, *args, **kwargs):
        if not self.slug:
            if self.user and self.user.username:
                self.slug = slugify(self.user.username)
            elif self.display_name:
                self.slug = slugify(self.display_name)

        if self.twitter_handle.startswith("@"):
            self.twitter_handle = self.twitter_handle[1:]
        if self.instagram_handle.startswith("@"):
            self.instagram_handle = self.instagram_handle[1:]
        if self.facebook_handle.startswith("@"):
            self.facebook_handle = self.facebook_handle[1:]
        if self.flickr_handle.startswith("@"):
            self.flickr_handle = self.flickr_handle[1:]

        return super().save(*args, **kwargs)

    def make_credit(self, include_larppikuvat_profile=False, **extra_attrs):
        result = pick_attrs(
            self,
            "path",
            "display_name",
            "homepage_url",
            "twitter_handle",
            "instagram_handle",
            "facebook_handle",
            "flickr_handle",
            "has_email",
            **extra_attrs,
        )

        if include_larppikuvat_profile:
            try:
                result["larppikuvat_profile"] = self.larppikuvat_profile.as_dict()
            except ObjectDoesNotExist:
                pass

        return result

    def make_subalbum(self):
        return pick_attrs(
            self,
            "path",
            "title",
            "is_public",
            redirect_url="",
            date="",
            thumbnail=self._make_thumbnail(),
        )

    def make_album(self):
        """
        Returns an album-like dict representation of the Photographer.
        """
        from .album import Album

        return pick_attrs(
            self,
            "path",
            "title",
            "body",
            "is_public",
            subalbums=[
                album.make_subalbum(context="photographer")
                for album in Album.get_albums(
                    photographer=self, is_public=True, is_visible=True
                )
            ],
            pictures=[],
            breadcrumb=[
                Album.objects.get(path="/")._make_breadcrumb(),
                dict(path="/photographers", title="Photographers"),
            ],
            redirect_url="",
            is_downloadable=False,
            download_url="",
            date="",
            layout="yearly",
            credits=dict(
                photographer=self.make_credit(
                    include_larppikuvat_profile="larppikuvat"
                    in settings.INSTALLED_APPS,
                ),
            ),
            cover_picture=(
                self.cover_picture.as_dict(
                    include_credits=self.cover_picture.album.photographer != self
                )
                if self.cover_picture
                else None
            ),
        )

    @property
    def path(self):
        return f"/photographers/{self.slug}"

    @property
    def title(self):
        return self.display_name

    @property
    def is_public(self):
        return self.cover_picture_id is not None

    @property
    def has_email(self):
        return bool(self.email)

    class Meta:
        ordering = ("display_name",)
