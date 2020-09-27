from django.db import models

from edegal.utils import pick_attrs


class LarppikuvatPhotographerProfile(models.Model):
    photographer = models.OneToOneField('edegal.Photographer',
         on_delete=models.CASCADE,
         related_name="larppikuvat_profile",
    )

    contact = models.TextField(blank=True)
    hours = models.TextField(blank=True)
    delivery_schedule = models.TextField(blank=True)
    delivery_practice = models.TextField(blank=True)
    delivery_method = models.TextField(blank=True)
    copy_protection = models.TextField(blank=True)
    expected_compensation = models.TextField(blank=True)

    def as_dict(self):
        return pick_attrs(self,
            "contact",
            "hours",
            "delivery_schedule",
            "delivery_practice",
            "delivery_method",
            "copy_protection",
            "expected_compensation",
        )