from django.db import models


FORMAT_CHOICES = [
    ("avif", "AVIF"),
    ("webp", "WebP"),
    ("jpeg", "JPEG"),
]

ROLE_CHOICES = [
    ("thumbnail", "Thumbnail"),
    ("preview", "Preview"),
]

DEFAULT_FORMAT = "jpeg"


class MediaSpec(models.Model):
    max_width = models.PositiveIntegerField()
    max_height = models.PositiveIntegerField()
    quality = models.PositiveIntegerField()

    format = models.CharField(
        max_length=max(len(ext) for (ext, label) in FORMAT_CHOICES),
        default=DEFAULT_FORMAT,
    )

    role = models.CharField(
        max_length=max(len(ext) for (ext, label) in ROLE_CHOICES),
        choices=ROLE_CHOICES,
        default="thumbnail",  # XXX
    )

    active = models.BooleanField(default=True)

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
