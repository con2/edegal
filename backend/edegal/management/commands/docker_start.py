# encoding: utf-8

import logging

from django.conf import settings
from django.db import ProgrammingError, OperationalError
from django.core.management import call_command
from django.core.management.base import BaseCommand


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    args = ''
    help = 'Docker development environment entry point'

    def handle(self, *args, **options):
        from edegal.models import Album

        test = settings.DEBUG

        if not test:
            raise ValueError('Should run with DEBUG=true')

        run_setup = False
        try:
            Album.objects.first()
        except (ProgrammingError, OperationalError):
            logger.info('First startup. Running setup...')
            run_setup = True

        if run_setup:
            call_command('setup')

        call_command('runserver', '0.0.0.0:8000')
