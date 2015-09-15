import logging

from django.core.management import BaseCommand

from ...models import MediaSpec
from ...utils import log_get_or_create

logger = logging.getLogger(__name__)

DEFAULT_MEDIA_SPECS = [
    # w, h, q
    (900, 240, 60),
    (1200, 600, 85),
    (1600, 800, 85),
    (2400, 1200, 85),
]


class Command(BaseCommand):
    def handle(self, *args, **options):
        for width, height, quality in DEFAULT_MEDIA_SPECS:
            spec, created = MediaSpec.objects.get_or_create(
                max_width=width,
                max_height=height,
                defaults=dict(
                    quality=quality,
                ),
            )

            log_get_or_create(logger, spec, created)
