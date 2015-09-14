import logging

from django.contrib.auth import get_user_model
from django.core.management import BaseCommand, call_command
from django.conf import settings


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--test', action='store_true', default=False)

    def handle(self, *args, **options):
        test = options['test']

        management_commands = [
            (('collectstatic',), dict(interactive=False)),
            (('migrate',), dict()),
        ]

        if 'kompassi_oauth2' in settings.INSTALLED_APPS:
            management_commands.append((('setup_kompassi_oauth2',), dict()))

        if 'test':
            management_commands.append((('setup_example_content',), dict()))

        for pargs, opts in management_commands:
            call_command(*pargs, **opts)

        if test:
            user, created = get_user_model().objects.get_or_create(
                username='mahti',
                first_name='Markku',
                last_name='Mahtinen',
                is_staff=True,
                is_superuser=True,
            )

            if created:
                user.set_password('mahti')
                user.save()
                logger.warn('Creating superuser "mahti" with password "mahti"')
