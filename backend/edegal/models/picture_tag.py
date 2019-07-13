from django.db import models

from .common import CommonFields


class PictureTag(models.Model):
    picture = models.ForeignKey('edegal.Picture', on_delete=models.CASCADE)
    tag = models.ForeignKey('edegal.Tag', on_delete=models.CASCADE)

    created_at = models.DateTimeField(**CommonFields.created_at)
    updated_at = models.DateTimeField(**CommonFields.updated_at)
    created_by = models.ForeignKey(**CommonFields.created_by)

    class Meta:
        unique_together = [('picture', 'tag')]
        index_together = [('tag', 'picture')]
