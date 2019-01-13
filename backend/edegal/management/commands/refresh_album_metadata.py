import logging

from django.core.management import BaseCommand

from ...models import Album


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """
    Refreshes all auto-guessable metadata for selected albums.
    """

    def add_arguments(self, parser):
        parser.add_argument(
            '-p', '--path',
            default='/',
            help='Subtree to process',
        )

    def handle(self, *args, **options):
        start_album = Album.objects.get(path=options['path'])

        for album in start_album.get_descendants(include_self=True):
            logger.info('refresh_album_metadata visiting %s', album)
            album.save(traverse=False)
