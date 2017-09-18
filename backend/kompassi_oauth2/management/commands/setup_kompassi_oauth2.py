from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    args = ''
    help = 'Setup Kompassi OAuth2'

    def handle(self, *args, **options):
        group, unused = Group.objects.get_or_create(name=settings.KOMPASSI_EDITOR_GROUP)

        permissions = Permission.objects.filter(
            content_type__app_label='edegal',
            content_type__model__in=['album', 'picture', 'termsandconditions', 'media'],
        )

        group.permissions.add(*permissions)
