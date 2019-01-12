import argparse

from django.core.management import BaseCommand

from ...importers.flickr_link import import_flickr_link


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


    def handle(self, *args, **options):
        for flickr_url in options['flickr_urls']:
            import_flickr_link(
                path=options['path'],
                flickr_url=flickr_url,
                override_title=options['title'],
                override_slug=options['slug'],
            )
