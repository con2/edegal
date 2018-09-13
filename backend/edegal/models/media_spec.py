from django.db import models


FORMAT_CHOICES = [
    ('jpeg', 'JPEG'),
    ('webp', 'WebP'),
]


class MediaSpec(models.Model):
    max_width = models.PositiveIntegerField()
    max_height = models.PositiveIntegerField()
    quality = models.PositiveIntegerField()
    format = models.CharField(
        max_length=max(len(ext) for (ext, label) in FORMAT_CHOICES),
        default='jpeg',
    )

    is_default_thumbnail = models.BooleanField(default=False)

    @property
    def size(self):
        return self.max_width, self.max_height

    def __str__(self):
        return "{width}x{height}q{quality}.{format}".format(
            width=self.max_width,
            height=self.max_height,
            quality=self.quality,
            format=self.format,
        )
