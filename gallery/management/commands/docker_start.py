# encoding: utf-8

import logging

from django.conf import settings
from django.db import ProgrammingError, OperationalError
from django.core.management import call_command, get_commands
from django.core.management.base import BaseCommand


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    args = ''
    help = 'Docker development environment entry point'

    def handle(self, *args, **options):
        from gallery.models import Album

        test = settings.DEBUG

        if not test:
            raise ValueError('Should run with DEBUG=true')

        try:
            Album.objects.first()
        except (ProgrammingError, OperationalError):
            call_command('setup')

        call_command('runserver', '0.0.0.0:8000')
