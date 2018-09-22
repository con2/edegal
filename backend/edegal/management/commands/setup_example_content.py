import logging
from glob import glob

from django.core.management import BaseCommand

from ...models import Album, TermsAndConditions, Picture
from ...importers.filesystem import FilesystemImporter
from ...utils import log_get_or_create


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            '-f', '--force',
            default=False,
            action='store_true',
            help='Create example content even if there is content already',
        )

    def handle(self, *args, **options):
        if Album.objects.exists() and not options['force']:
            logger.info('There is already content in the database – skipping creating example content')
            return

        logger.info('Creating example content')

        root, created = Album.objects.get_or_create(
            path='/',
            defaults=dict(
                title='My Swell Picture Gallery',
            ),
        )

        log_get_or_create(logger, root, created)

        album1, created = Album.objects.get_or_create(
            path='/album-1',
            defaults=dict(
                title='Album, the First of his Name',
                slug='album-1',
                parent=root,
            )
        )

        log_get_or_create(logger, album1, created)

        FilesystemImporter(
            path=album1.path,
            input_filenames=glob('example_content/*.jpg'),
            mode='copy',
        ).run()

        tac, unused = TermsAndConditions.get_or_create(
            text='For personal use only. All rights reserved.',
        )

        if created:
            picture = Picture.objects.filter(album=album1).first()
            picture.override_terms_and_conditions = tac
            picture.save()
