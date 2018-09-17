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
        assert not options['force'], "not yet implemented"
        self.check_for_empty_src()

    def check_for_empty_src(self):
        for medium in Media.objects.filter(src__isnull=True):
            print('null media:', medium)

        for medium in Media.objects.filter(src=''):
            print('empty media:', medium)
