import logging
from datetime import date
from glob import glob

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management import BaseCommand

from ...models import Album, TermsAndConditions, Photographer, Series
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
        assert settings.DEBUG, "Please don't use setup_example_content in production"

        User = get_user_model()

        user, created = User.objects.get_or_create(
            username='mahti',
            first_name='Markku',
            last_name='Mahtinen',
            is_staff=True,
            is_superuser=True,
        )

        if created:
            user.set_password('mahti')
            user.save()

        log_get_or_create(logger, user, created)

        if Album.objects.exists() and not options['force']:
            logger.info('There is already content in the database – skipping creating example content')
            return

        logger.info('Creating example content')

        tac, unused = TermsAndConditions.get_or_create(
            text='For personal use only. All rights reserved.',
        )
        log_get_or_create(logger, tac, created)

        photographer, created = Photographer.objects.get_or_create(
            user=User.objects.first(),
            defaults=dict(
                display_name='Example Photographer',
                email='example@example.com',
                twitter_handle='example',
                instagram_handle='example',
            ),
        )
        log_get_or_create(logger, photographer, created)

        root, created = Album.objects.get_or_create(
            path='/',
            defaults=dict(
                title='My Swell Picture Gallery',
                layout='yearly',
            ),
        )
        log_get_or_create(logger, root, created)

        series, created = Series.objects.get_or_create(
            slug='test-series',
            defaults=dict(
                title='Test series',
            )
        )
        log_get_or_create(logger, series, created)

        album1, created = Album.objects.get_or_create(
            path='/album-1',
            defaults=dict(
                title='Album, the First of his Name',
                slug='album-1',
                parent=root,
                series=series,
                date=date(2019, 1, 1),
                photographer=photographer,
                terms_and_conditions=tac,
            )
        )
        log_get_or_create(logger, album1, created)

        album2, created = Album.objects.get_or_create(
            path='/album-2',
            defaults=dict(
                title='Album, the Second of his Name',
                slug='album-2',
                parent=root,
                series=series,
                date=date(2019, 1, 2),
                photographer=photographer,
                terms_and_conditions=tac,
            )
        )
        log_get_or_create(logger, album2, created)

        for album in [album1, album2]:
            FilesystemImporter(
                path=album.path,
                input_filenames=glob('example_content/*.jpg'),
                mode='copy',
            ).run()
