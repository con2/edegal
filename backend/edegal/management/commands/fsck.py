import logging

from django.core.management import BaseCommand
from django.db.models import Q

from ...models import Album, Media, Picture


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
        self.check_for_pictures_without_media(fix=options['force'])
        self.check_for_next_or_previous_in_series_without_series(fix=options['force'])

    def check_for_empty_src(self, fix):
        media = Media.objects.filter(src='')

        if media.exists():
            if fix:
                parts = ['Media with empty src (deleting):']
            else:
                parts = ['Media with empty src (--force to delete):']

            parts.extend(str(medium) for medium in media)

            logger.warning('\n'.join(parts))

            if fix:
                media.delete()

    def check_for_pictures_without_media(self, fix):
        pictures = Picture.objects.filter(media__isnull=True)

        if pictures.exists():
            if fix:
                parts = ['Pictures without media (deleting):']
            else:
                parts = ['Pictures without media (--force to delete):']

            parts.extend(str(picture) for picture in pictures)

            logger.warning('\n'.join(parts))

            if fix:
                pictures.delete()

    def check_for_next_or_previous_in_series_without_series(self, fix):
        q = Q(series__isnull=True) & (Q(next_in_series__isnull=False) | Q(previous_in_series__isnull=False))
        albums = Album.objects.filter(q)

        if albums.exists():
            if fix:
                parts = ['Albums with next/previous linkage without Series (clearing):']
            else:
                parts = ['Albums with next/previous linkage without Series (--force to clear):']

            parts.extend(str(album) for album in albums)

            logger.warning('\n'.join(parts))

            if fix:
                albums.update(next_in_series=None, previous_in_series=None)
