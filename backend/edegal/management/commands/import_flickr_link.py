import argparse
import logging

from django.core.management import BaseCommand

from ...importers.flickr_link import import_flickr_link


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('flickr_urls', nargs='+', metavar='INPUT_FILE')
        parser.add_argument(
            '-p', '--path',
            default='/',
            help='Parent path (defaults to gallery root)',
        )
        parser.add_argument(
            '-t', '--title',
            help='Override title (defaults to Flickr title)',
        )
        parser.add_argument(
            '-s', '--slug',
            help='Override slug (defaults to slugified title)',
        )
        parser.add_argument(
            '-l', '--leaf-album-title',
            help='Use 2-level layout when importing. In larppikuvat.fi, argument is the name of the photographer.',
        )
        parser.add_argument(
            '-d', '--strip-date-from-title',
            help='Strip date from title and move it to description',
            action='store_true',
        )


    def handle(self, *args, **options):
        for flickr_url in options['flickr_urls']:
            try:
                import_flickr_link(
                    path=options['path'],
                    flickr_url=flickr_url,
                    override_title=options['title'],
                    override_slug=options['slug'],
                    leaf_album_title=options['leaf_album_title'],
                    strip_date_from_title=options['strip_date_from_title'],
                )
            except Exception:
                logger.exception("Failed to import %s", flickr_url)
