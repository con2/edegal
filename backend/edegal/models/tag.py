from django.db import models

from .common import CommonFields


class Tag(models.Model):
    # REVERSE: pictures = models.ManyToMany(Picture, through=PictureTag)

    slug = models.CharField(unique=True, **CommonFields.slug)
    title = models.CharField(**CommonFields.title)

    is_sensitive = models.BooleanField(default=False, help_text='Pictures with sensitive tags will show a content warning.')
    is_visible = models.BooleanField(**CommonFields.is_visible)

    created_at = models.DateTimeField(**CommonFields.created_at)
    updated_at = models.DateTimeField(**CommonFields.updated_at)
    created_by = models.ForeignKey(**CommonFields.created_by)

    def __str__(self):
        return self.slug
