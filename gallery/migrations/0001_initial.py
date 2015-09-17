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
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.CharField(verbose_name='Tekninen nimi', validators=[django.core.validators.RegexValidator(regex='[a-z0-9-]+', message='Tekninen nimi saa sisältää vain pieniä kirjaimia, numeroita sekä väliviivoja.')], max_length=63, help_text='Tekninen nimi eli "slug" näkyy URL-osoitteissa. Sallittuja merkkejä ovat pienet kirjaimet, numerot ja väliviiva. Jos jätät teknisen nimen tyhjäksi, se generoidaan automaattisesti otsikosta. Jos muutat teknistä nimeä julkaisun jälkeen, muista luoda tarvittavat uudelleenojaukset.', blank=True)),
                ('path', models.CharField(validators=[django.core.validators.RegexValidator(regex='[a-z0-9-/]+', message='Polku saa sisältää vain pieniä kirjaimia, numeroita, väliviivoja sekä kauttaviivoja.')], max_length=1023, help_text='Polku määritetään automaattisesti teknisen nimen perusteella.', verbose_name='Polku')),
                ('title', models.CharField(max_length=1023, verbose_name='Otsikko', help_text='Otsikko näytetään automaattisesti sivun ylälaidassa sekä valikossa. Älä lisää erillistä pääotsikkoa sivun tekstiin.')),
                ('description', models.TextField(default='', verbose_name='Kuvaus', help_text='Näkyy mm. hakukoneille sekä RSS-asiakasohjelmille.', blank=True)),
                ('lft', models.PositiveIntegerField(editable=False, db_index=True)),
                ('rght', models.PositiveIntegerField(editable=False, db_index=True)),
                ('tree_id', models.PositiveIntegerField(editable=False, db_index=True)),
                ('level', models.PositiveIntegerField(editable=False, db_index=True)),
                ('parent', mptt.fields.TreeForeignKey(related_name='subalbums', null=True, verbose_name='Yläalbumi', to='gallery.Album', help_text='Tämä albumi luodaan valitun albumin alaisuuteen. Juurialbumilla ei ole yläalbumia.', blank=True)),
            ],
            options={
                'verbose_name': 'Albumi',
                'verbose_name_plural': 'Albumit',
            },
        ),
        migrations.CreateModel(
            name='Media',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('width', models.PositiveIntegerField(default=0)),
                ('height', models.PositiveIntegerField(default=0)),
                ('src', models.ImageField(upload_to='', null=True, max_length=255, width_field='width', height_field='height')),
            ],
            options={
                'verbose_name': 'Media',
                'verbose_name_plural': 'Media',
            },
        ),
        migrations.CreateModel(
            name='MediaSpec',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('max_width', models.PositiveIntegerField()),
                ('max_height', models.PositiveIntegerField()),
                ('quality', models.PositiveIntegerField()),
                ('is_default_thumbnail', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Picture',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.CharField(verbose_name='Tekninen nimi', validators=[django.core.validators.RegexValidator(regex='[a-z0-9-]+', message='Tekninen nimi saa sisältää vain pieniä kirjaimia, numeroita sekä väliviivoja.')], max_length=63, help_text='Tekninen nimi eli "slug" näkyy URL-osoitteissa. Sallittuja merkkejä ovat pienet kirjaimet, numerot ja väliviiva. Jos jätät teknisen nimen tyhjäksi, se generoidaan automaattisesti otsikosta. Jos muutat teknistä nimeä julkaisun jälkeen, muista luoda tarvittavat uudelleenojaukset.', blank=True)),
                ('order', models.IntegerField(default=0, verbose_name='Järjestys', help_text='Saman yläsivun alaiset sivut järjestetään valikossa tämän luvun mukaan nousevaan järjestykseen (pienin ensin).')),
                ('path', models.CharField(verbose_name='Polku', validators=[django.core.validators.RegexValidator(regex='[a-z0-9-/]+', message='Polku saa sisältää vain pieniä kirjaimia, numeroita, väliviivoja sekä kauttaviivoja.')], max_length=1023, help_text='Polku määritetään automaattisesti teknisen nimen perusteella.', db_index=True)),
                ('title', models.CharField(max_length=1023, verbose_name='Otsikko', help_text='Otsikko näytetään automaattisesti sivun ylälaidassa sekä valikossa. Älä lisää erillistä pääotsikkoa sivun tekstiin.')),
                ('description', models.TextField(default='', verbose_name='Kuvaus', help_text='Näkyy mm. hakukoneille sekä RSS-asiakasohjelmille.', blank=True)),
                ('album', models.ForeignKey(related_name='pictures', to='gallery.Album')),
            ],
            options={
                'verbose_name': 'Kuva',
                'verbose_name_plural': 'Kuvat',
                'ordering': ('album', 'order'),
            },
        ),
        migrations.AddField(
            model_name='media',
            name='picture',
            field=models.ForeignKey(related_name='media', to='gallery.Picture'),
        ),
        migrations.AddField(
            model_name='media',
            name='spec',
            field=models.ForeignKey(null=True, to='gallery.MediaSpec', blank=True),
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
