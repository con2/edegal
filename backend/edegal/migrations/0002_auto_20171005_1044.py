# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-10-05 07:44
from __future__ import unicode_literals

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('edegal', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='album',
            name='slug',
            field=models.CharField(blank=True, help_text='Tekninen nimi eli "slug" näkyy URL-osoitteissa. Sallittuja merkkejä ovat pienet kirjaimet, numerot ja väliviiva. Jos jätät teknisen nimen tyhjäksi, se generoidaan automaattisesti otsikosta. Jos muutat teknistä nimeä julkaisun jälkeen, muista luoda tarvittavat uudelleenohjaukset.', max_length=127, validators=[django.core.validators.RegexValidator(message='Tekninen nimi saa sisältää vain pieniä kirjaimia, numeroita sekä väliviivoja.', regex='[a-z0-9-]+')], verbose_name='Tekninen nimi'),
        ),
        migrations.AlterField(
            model_name='picture',
            name='slug',
            field=models.CharField(blank=True, help_text='Tekninen nimi eli "slug" näkyy URL-osoitteissa. Sallittuja merkkejä ovat pienet kirjaimet, numerot ja väliviiva. Jos jätät teknisen nimen tyhjäksi, se generoidaan automaattisesti otsikosta. Jos muutat teknistä nimeä julkaisun jälkeen, muista luoda tarvittavat uudelleenohjaukset.', max_length=127, validators=[django.core.validators.RegexValidator(message='Tekninen nimi saa sisältää vain pieniä kirjaimia, numeroita sekä väliviivoja.', regex='[a-z0-9-]+')], verbose_name='Tekninen nimi'),
        ),
    ]