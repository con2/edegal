# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.core.validators
import mptt.fields


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Album',
            fields=[
                ('id', models.AutoField(primary_key=True, auto_created=True, verbose_name='ID', serialize=False)),
                ('slug', models.CharField(blank=True, validators=[django.core.validators.RegexValidator(regex='[a-z0-9-]+', message='Tekninen nimi saa sisältää vain pieniä kirjaimia, numeroita sekä väliviivoja.')], max_length=63, verbose_name='Tekninen nimi', help_text='Tekninen nimi eli "slug" näkyy URL-osoitteissa. Sallittuja merkkejä ovat pienet kirjaimet, numerot ja väliviiva. Jos jätät teknisen nimen tyhjäksi, se generoidaan automaattisesti otsikosta. Jos muutat teknistä nimeä julkaisun jälkeen, muista luoda tarvittavat uudelleenojaukset.')),
                ('path', models.CharField(validators=[django.core.validators.RegexValidator(regex='[a-z0-9-/]+', message='Polku saa sisältää vain pieniä kirjaimia, numeroita, väliviivoja sekä kauttaviivoja.')], max_length=1023, verbose_name='Polku', help_text='Polku määritetään automaattisesti teknisen nimen perusteella.')),
                ('title', models.CharField(max_length=1023, verbose_name='Otsikko', help_text='Otsikko näytetään automaattisesti sivun ylälaidassa sekä valikossa. Älä lisää erillistä pääotsikkoa sivun tekstiin.')),
                ('description', models.TextField(blank=True, verbose_name='Kuvaus', default='', help_text='Näkyy mm. hakukoneille sekä RSS-asiakasohjelmille.')),
                ('lft', models.PositiveIntegerField(db_index=True, editable=False)),
                ('rght', models.PositiveIntegerField(db_index=True, editable=False)),
                ('tree_id', models.PositiveIntegerField(db_index=True, editable=False)),
                ('level', models.PositiveIntegerField(db_index=True, editable=False)),
                ('parent', mptt.fields.TreeForeignKey(to='gallery.Album', verbose_name='Yläalbumi', help_text='Tämä albumi luodaan valitun albumin alaisuuteen. Juurialbumilla ei ole yläalbumia.', blank=True, related_name='subalbums', null=True)),
            ],
            options={
                'verbose_name_plural': 'Albumit',
                'verbose_name': 'Albumi',
            },
        ),
        migrations.CreateModel(
            name='Media',
            fields=[
                ('id', models.AutoField(primary_key=True, auto_created=True, verbose_name='ID', serialize=False)),
                ('width', models.PositiveIntegerField(default=0)),
                ('height', models.PositiveIntegerField(default=0)),
                ('src', models.ImageField(upload_to='', width_field='width', null=True, height_field='height', max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='MediaSpec',
            fields=[
                ('id', models.AutoField(primary_key=True, auto_created=True, verbose_name='ID', serialize=False)),
                ('max_width', models.PositiveIntegerField()),
                ('max_height', models.PositiveIntegerField()),
                ('quality', models.PositiveIntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Picture',
            fields=[
                ('id', models.AutoField(primary_key=True, auto_created=True, verbose_name='ID', serialize=False)),
                ('slug', models.CharField(blank=True, validators=[django.core.validators.RegexValidator(regex='[a-z0-9-]+', message='Tekninen nimi saa sisältää vain pieniä kirjaimia, numeroita sekä väliviivoja.')], max_length=63, verbose_name='Tekninen nimi', help_text='Tekninen nimi eli "slug" näkyy URL-osoitteissa. Sallittuja merkkejä ovat pienet kirjaimet, numerot ja väliviiva. Jos jätät teknisen nimen tyhjäksi, se generoidaan automaattisesti otsikosta. Jos muutat teknistä nimeä julkaisun jälkeen, muista luoda tarvittavat uudelleenojaukset.')),
                ('order', models.IntegerField(default=0, verbose_name='Järjestys', help_text='Saman yläsivun alaiset sivut järjestetään valikossa tämän luvun mukaan nousevaan järjestykseen (pienin ensin).')),
                ('path', models.CharField(validators=[django.core.validators.RegexValidator(regex='[a-z0-9-/]+', message='Polku saa sisältää vain pieniä kirjaimia, numeroita, väliviivoja sekä kauttaviivoja.')], db_index=True, max_length=1023, verbose_name='Polku', help_text='Polku määritetään automaattisesti teknisen nimen perusteella.')),
                ('title', models.CharField(max_length=1023, verbose_name='Otsikko', help_text='Otsikko näytetään automaattisesti sivun ylälaidassa sekä valikossa. Älä lisää erillistä pääotsikkoa sivun tekstiin.')),
                ('description', models.TextField(blank=True, verbose_name='Kuvaus', default='', help_text='Näkyy mm. hakukoneille sekä RSS-asiakasohjelmille.')),
                ('album', models.ForeignKey(to='gallery.Album', related_name='pictures')),
            ],
            options={
                'verbose_name_plural': 'Kuvat',
                'verbose_name': 'Kuva',
                'ordering': ('album', 'order'),
            },
        ),
        migrations.AddField(
            model_name='media',
            name='picture',
            field=models.ForeignKey(to='gallery.Picture', related_name='media'),
        ),
        migrations.AddField(
            model_name='media',
            name='spec',
            field=models.ForeignKey(to='gallery.MediaSpec', blank=True, null=True),
        ),
        migrations.AlterUniqueTogether(
            name='picture',
            unique_together=set([('album', 'slug')]),
        ),
        migrations.AlterUniqueTogether(
            name='album',
            unique_together=set([('parent', 'slug')]),
        ),
    ]
