import logging

from django.core.management import BaseCommand

from ...importers.coppermine import CoppermineImporter


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            '-p', '--path',
            default='/',
            help='Target path in Edegal (defaults to gallery root)',
        )
        parser.add_argument(
            '-c', '--root-category-id',
            type=int,
            default=0,
            help='Root category ID in Coppermine (defaults to gallery root)',
        )
        parser.add_argument(
            '-d', '--database-connection-name',
            default='coppermine',
            help=(
                'Database connection name for Coppermine. Needs to be '
                'configured in settings.py.'
            ),
        )
        parser.add_argument(
            '-m', '--media-root',
            default='',
            help='Will be prepended to all file paths from Coppermine.',
        )
        parser.add_argument(
            '-s', '--skip-previews',
            action='store_true',
            help='Skip creating previews. For development only.',
        )

    def handle(self, *args, **options):
        logger.info('Running CoppermineImporter with options: %s', options)
        CoppermineImporter(
            path=options['path'],
            root_category_id=options['root_category_id'],
            connection_name=options['database_connection_name'],
            create_previews=not options['skip_previews'],
            media_root=options['media_root'],
        ).run()
