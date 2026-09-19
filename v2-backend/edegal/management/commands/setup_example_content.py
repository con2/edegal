import logging
import shutil
from datetime import date
from glob import glob
from os import makedirs
from os.path import basename, join

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management import BaseCommand

from ...importers.filesystem import FilesystemImporter
from ...models import Album, Photographer, Picture, Series, TermsAndConditions
from ...utils import log_get_or_create

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            "-f",
            "--force",
            default=False,
            action="store_true",
            help="Create example content even if there is content already",
        )

    def handle(self, *args, **options):
        assert settings.DEBUG, "Please don't use setup_example_content in production"

        User = get_user_model()

        user, created = User.objects.get_or_create(
            username="mahti",
            first_name="Markku",
            last_name="Mahtinen",
            is_staff=True,
            is_superuser=True,
        )

        if created:
            user.set_password("mahti")
            user.save()

        log_get_or_create(logger, user, created)

        if Album.objects.exists() and not options["force"]:
            logger.info("There is already content in the database – skipping creating example content")
            return

        logger.info("Creating example content")

        tac, unused = TermsAndConditions.get_or_create(
            text="For personal use only. All rights reserved.",
        )
        log_get_or_create(logger, tac, created)

        photographer, created = Photographer.objects.get_or_create(
            user=User.objects.first(),
            defaults=dict(
                display_name="Example Photographer",
                email="example@example.com",
                twitter_handle="example",
                instagram_handle="example",
            ),
        )
        log_get_or_create(logger, photographer, created)

        root, created = Album.objects.get_or_create(
            path="/",
            defaults=dict(
                title="My Swell Picture Gallery",
                layout="yearly",
            ),
        )
        log_get_or_create(logger, root, created)

        series, created = Series.objects.get_or_create(
            slug="test-series",
            defaults=dict(
                title="Test series",
            ),
        )
        log_get_or_create(logger, series, created)

        album1, created = Album.objects.get_or_create(
            path="/album-1",
            defaults=dict(
                title="Album, the First of his Name",
                slug="album-1",
                parent=root,
                series=series,
                date=date(2019, 1, 1),
                photographer=photographer,
                terms_and_conditions=tac,
                is_downloadable=False,
            ),
        )
        log_get_or_create(logger, album1, created)

        album2, created = Album.objects.get_or_create(
            path="/album-2",
            defaults=dict(
                title="Album, the Second of his Name",
                slug="album-2",
                parent=root,
                series=series,
                date=date(2019, 1, 2),
                photographer=photographer,
                terms_and_conditions=tac,
            ),
        )
        log_get_or_create(logger, album2, created)

        # The importer uses files where they lie, so the examples are first copied under MEDIA_ROOT.
        for album in [album1, album2]:
            pictures_dir = join(settings.MEDIA_ROOT, "pictures", album.path.strip("/"))
            makedirs(pictures_dir, exist_ok=True)
            input_filenames = []
            for example in sorted(glob("example_content/*.jpg")):
                target = join(pictures_dir, basename(example))
                shutil.copyfile(example, target)
                input_filenames.append(target)
            FilesystemImporter(path=album.path, input_filenames=input_filenames).run()

        some_photo = Picture.objects.filter(album__photographer__isnull=False).first()
        photographer.cover_picture = some_photo
        photographer.save()
