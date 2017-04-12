import logging

from django.conf import settings
from django.core.mail import EmailMessage
from django.core.management import call_command

from celery import shared_task

from .models import Media, Picture, MediaSpec


logger = logging.getLogger(__name__)


@shared_task(ignore_result=True)
def send_email(**opts):
    if settings.DEBUG:
        logger.debug(opts['body'])

    EmailMessage(**opts).send(fail_silently=False)


@shared_task(ignore_result=True)
def run_admin_command(*args, **kwargs):
    call_command(*args, **kwargs)


@shared_task(ignore_result=True)
def import_local_media(picture_id, input_filename, mode, media_specs_ids, refresh_album):
    picture = Picture.objects.get(id=picture_id)
    media_specs = MediaSpec.objects.filter(id__in=media_specs_ids)
    assert media_specs.count() == len(media_specs_ids)

    Media._import_local_media(picture, input_filename, mode, media_specs, refresh_album)
