import logging

from django.core.management import BaseCommand

from ...models import Media, Picture


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            '-f', '--force',
            default=False,
            action='store_true',
            help='Actually make changes to data (default: just print out warnings)',
        )

    def handle(self, *args, **options):
        self.check_for_empty_src(fix=options['force'])

    def check_for_empty_src(self, fix):
        for medium in Media.objects.filter(src=''):
            if medium.role == 'original':
                logger.error('original media with empty src (cannot auto-fix): %s', medium)
            else:
                picture = medium.picture
                original_media = picture.get_media('original_media')

                if original_media:
                    logger.warn('derived media with empty src: %s', medium)

                    if fix:
                        spec = medium.spec
                        medium.delete()
                        Media.create_scaled_media(original_media, spec)
                else:
                    logger.error('derived media with empty src, original missing (cannot auto-fix): %s', medium)
