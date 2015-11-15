# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('gallery', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='album',
            name='is_public',
            field=models.BooleanField(default=True, help_text='Ei-julkiset albumit näkyvät vain ylläpitokäyttäjille.', verbose_name='Julkinen'),
        ),
    ]
