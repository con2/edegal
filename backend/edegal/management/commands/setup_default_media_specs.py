import logging

from django.core.management import BaseCommand

from ...models import MediaSpec
from ...utils import log_get_or_create

logger = logging.getLogger(__name__)

DEFAULT_MEDIA_SPECS = [
    # w, h, q, fmt, role
    (900, 240, 60, "jpeg", "thumbnail"),
    (2400, 1350, 85, "jpeg", "preview"),
    (900, 240, 75, "webp", "thumbnail"),
    # (2400, 1350, 90, "webp", "preview"),
    # XXX avif thumbnails actually bigger than webp/jpeg, disable for now
    # (900, 240, 30, "avif", "thumbnail"),
    (2400, 1350, 60, "avif", "preview"),
]


class Command(BaseCommand):
    def handle(self, *args, **options):
        for width, height, quality, format, role in DEFAULT_MEDIA_SPECS:
            try:
                spec, created = MediaSpec.objects.get_or_create(
                    format=format,
                    role=role,
                    active=True,
                    defaults=dict(
                        max_width=width,
                        max_height=height,
                        quality=quality,
                    ),
                )
            except MediaSpec.MultipleObjectsReturned:
                logger.warn("Multiple MediaSpecs for %s %s", format, role)
            else:
                log_get_or_create(logger, spec, created)
