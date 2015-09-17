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
            name='cover_picture',
            field=models.ForeignKey(blank=True, null=True, related_name='+', to='gallery.Picture'),
        ),
    ]
