# -*- coding: utf-8 -*-
# Generated by Django 1.11.18 on 2019-01-13 11:21
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('edegal', '0013_auto_20181223_1412'),
    ]

    operations = [
        migrations.AddField(
            model_name='album',
            name='date',
            field=models.DateField(null=True),
        ),
    ]
