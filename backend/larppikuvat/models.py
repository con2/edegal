from django.db import models
from edegal.models.common import make_body_field
from edegal.utils import pick_attrs


class LarppikuvatPhotographerProfile(models.Model):
    photographer = models.OneToOneField(
        "edegal.Photographer",
        on_delete=models.CASCADE,
        related_name="larppikuvat_profile",
    )

    contact = make_body_field(
        verbose_name="Miten saat minuun yhteyden?",
        help_text="",
    )

    hours = models.TextField(
        blank=True,
        verbose_name="Millaista työmäärää minulta voi odottaa larppia kuvatessani?",
    )

    delivery_schedule = models.TextField(
        blank=True,
        verbose_name="Millaisella aikataululla toimitan tyypillisesti valmiit kuvat?",
    )

    delivery_practice = models.TextField(
        blank=True,
        verbose_name="Miten toimitan valmiit kuvat pelin osallistujille ja millaista karanteenia sovellan?",
    )

    delivery_method = make_body_field(
        verbose_name="Miten julkaisen valmiit kuvat suurelle yleisölle?",
        help_text="",
    )

    copy_protection = make_body_field(
        verbose_name="Mitä kuvillani saa tehdä ja millaisia kopiosuojauksia käytän?",
        help_text="",
    )

    expected_compensation = models.TextField(
        blank=True,
        verbose_name="Millaista korvausta odotan larppikuvauksesta?",
    )

    def as_dict(self):
        return pick_attrs(
            self,
            "contact",
            "hours",
            "delivery_schedule",
            "delivery_practice",
            "delivery_method",
            "copy_protection",
            "expected_compensation",
        )
