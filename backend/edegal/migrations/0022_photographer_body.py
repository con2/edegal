# -*- coding: utf-8 -*-
# Generated by Django 1.11.25 on 2019-11-01 10:30
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('edegal', '0021_photographer_cover_picture'),
    ]

    operations = [
        migrations.AddField(
            model_name='photographer',
            name='body',
            field=models.TextField(blank=True, default='', help_text='Will be displayed at the top of the photographer view before albums.', verbose_name='Introduction text'),
        ),
    ]
