import argparse

from django.core.management import BaseCommand

from ...importers import FilesystemImporter


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('input_files', nargs='+', metavar='INPUT_FILE', type=argparse.FileType('rb'))
        parser.add_argument('-p', '--path', required=True)

    def handle(self, *args, **options):
        FilesystemImporter(path=options['path'], input_files=options['input_files']).run()
