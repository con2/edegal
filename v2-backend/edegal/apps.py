from django.apps import AppConfig
from django.db.models.signals import post_save


class EdegalConfig(AppConfig):
    name = "edegal"

    def ready(self):
        from .models.import_job import ImportJob

        post_save.connect(ImportJob.post_save, sender=ImportJob)
