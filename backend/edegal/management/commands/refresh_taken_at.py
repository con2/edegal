import logging

from django.core.management import BaseCommand

from ...models import Media


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            default=False,
            action='store_true',
            help='Just print out warnings instead of actually changing things',
        )

        parser.add_argument(
            '-p', '--path',
            default='/',
            help='Subtree to process',
        )

    def handle(self, *args, **options):
        path = options["path"]
        if not path.endswith('/'):
            path += '/'

        for original_media in Media.objects.filter(
            role='original',
            picture__path__startswith=path,
            picture__taken_at__isnull=True,
        ):
            picture = original_media.picture
            picture.taken_at = original_media.get_exif_datetime()

            if picture.taken_at:
                picture.save()
                print('+', end='', flush=True)
            else:
                print('-', end='', flush=True)

        print()
