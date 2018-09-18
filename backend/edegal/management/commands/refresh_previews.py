import logging

from django.core.management import BaseCommand

from ...models import Album


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
        start_album = Album.objects.get(path=options['path'])

        for album in start_album.get_descendants(include_self=True):
            logger.info('refresh_previews visiting %s', album)
            for picture in album.pictures.all():
                picture.refresh_media(dry_run=options['dry_run'])
