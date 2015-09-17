# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import mptt.fields
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Album',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False, auto_created=True, verbose_name='ID')),
                ('slug', models.CharField(validators=[django.core.validators.RegexValidator(message='Tekninen nimi saa sisältää vain pieniä kirjaimia, numeroita sekä väliviivoja.', regex='[a-z0-9-]+')], max_length=63, help_text='Tekninen nimi eli "slug" näkyy URL-osoitteissa. Sallittuja merkkejä ovat pienet kirjaimet, numerot ja väliviiva. Jos jätät teknisen nimen tyhjäksi, se generoidaan automaattisesti otsikosta. Jos muutat teknistä nimeä julkaisun jälkeen, muista luoda tarvittavat uudelleenojaukset.', blank=True, verbose_name='Tekninen nimi')),
                ('path', models.CharField(validators=[django.core.validators.RegexValidator(message='Polku saa sisältää vain pieniä kirjaimia, numeroita, väliviivoja sekä kauttaviivoja.', regex='[a-z0-9-/]+')], max_length=1023, help_text='Polku määritetään automaattisesti teknisen nimen perusteella.', unique=True, verbose_name='Polku')),
                ('title', models.CharField(max_length=1023, help_text='Otsikko näytetään automaattisesti sivun ylälaidassa sekä valikossa. Älä lisää erillistä pääotsikkoa sivun tekstiin.', verbose_name='Otsikko')),
                ('description', models.TextField(default='', help_text='Näkyy mm. hakukoneille sekä RSS-asiakasohjelmille.', blank=True, verbose_name='Kuvaus')),
                ('lft', models.PositiveIntegerField(editable=False, db_index=True)),
                ('rght', models.PositiveIntegerField(editable=False, db_index=True)),
                ('tree_id', models.PositiveIntegerField(editable=False, db_index=True)),
                ('level', models.PositiveIntegerField(editable=False, db_index=True)),
            ],
            options={
                'verbose_name_plural': 'Albumit',
                'verbose_name': 'Albumi',
            },
        ),
        migrations.CreateModel(
            name='Media',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False, auto_created=True, verbose_name='ID')),
                ('width', models.PositiveIntegerField(default=0)),
                ('height', models.PositiveIntegerField(default=0)),
                ('src', models.ImageField(upload_to='', max_length=255, height_field='height', width_field='width', null=True)),
            ],
            options={
                'verbose_name_plural': 'Media',
                'verbose_name': 'Media',
            },
        ),
        migrations.CreateModel(
            name='MediaSpec',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False, auto_created=True, verbose_name='ID')),
                ('max_width', models.PositiveIntegerField()),
                ('max_height', models.PositiveIntegerField()),
                ('quality', models.PositiveIntegerField()),
                ('is_default_thumbnail', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Picture',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False, auto_created=True, verbose_name='ID')),
                ('slug', models.CharField(validators=[django.core.validators.RegexValidator(message='Tekninen nimi saa sisältää vain pieniä kirjaimia, numeroita sekä väliviivoja.', regex='[a-z0-9-]+')], max_length=63, help_text='Tekninen nimi eli "slug" näkyy URL-osoitteissa. Sallittuja merkkejä ovat pienet kirjaimet, numerot ja väliviiva. Jos jätät teknisen nimen tyhjäksi, se generoidaan automaattisesti otsikosta. Jos muutat teknistä nimeä julkaisun jälkeen, muista luoda tarvittavat uudelleenojaukset.', blank=True, verbose_name='Tekninen nimi')),
                ('order', models.IntegerField(default=0, help_text='Saman yläsivun alaiset sivut järjestetään valikossa tämän luvun mukaan nousevaan järjestykseen (pienin ensin).', verbose_name='Järjestys')),
                ('path', models.CharField(validators=[django.core.validators.RegexValidator(message='Polku saa sisältää vain pieniä kirjaimia, numeroita, väliviivoja sekä kauttaviivoja.', regex='[a-z0-9-/]+')], max_length=1023, help_text='Polku määritetään automaattisesti teknisen nimen perusteella.', unique=True, verbose_name='Polku')),
                ('title', models.CharField(max_length=1023, help_text='Otsikko näytetään automaattisesti sivun ylälaidassa sekä valikossa. Älä lisää erillistä pääotsikkoa sivun tekstiin.', verbose_name='Otsikko')),
                ('description', models.TextField(default='', help_text='Näkyy mm. hakukoneille sekä RSS-asiakasohjelmille.', blank=True, verbose_name='Kuvaus')),
                ('album', models.ForeignKey(related_name='pictures', to='gallery.Album')),
            ],
            options={
                'verbose_name_plural': 'Kuvat',
                'ordering': ('album', 'order'),
                'verbose_name': 'Kuva',
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
            field=models.ForeignKey(blank=True, null=True, to='gallery.MediaSpec'),
        ),
        migrations.AddField(
            model_name='album',
            name='cover_picture',
            field=models.ForeignKey(blank=True, related_name='+', null=True, to='gallery.Picture'),
        ),
        migrations.AddField(
            model_name='album',
            name='parent',
            field=mptt.fields.TreeForeignKey(help_text='Tämä albumi luodaan valitun albumin alaisuuteen. Juurialbumilla ei ole yläalbumia.', blank=True, to='gallery.Album', related_name='subalbums', null=True, verbose_name='Yläalbumi'),
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
