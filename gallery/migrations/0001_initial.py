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
                ('id', models.AutoField(auto_created=True, primary_key=True, verbose_name='ID', serialize=False)),
                ('slug', models.CharField(blank=True, help_text='Tekninen nimi eli "slug" näkyy URL-osoitteissa. Sallittuja merkkejä ovat pienet kirjaimet, numerot ja väliviiva. Jos jätät teknisen nimen tyhjäksi, se generoidaan automaattisesti otsikosta. Jos muutat teknistä nimeä julkaisun jälkeen, muista luoda tarvittavat uudelleenojaukset.', max_length=63, verbose_name='Tekninen nimi', validators=[django.core.validators.RegexValidator(regex='[a-z0-9-]+', message='Tekninen nimi saa sisältää vain pieniä kirjaimia, numeroita sekä väliviivoja.')])),
                ('path', models.CharField(help_text='Polku määritetään automaattisesti teknisen nimen perusteella.', max_length=1023, verbose_name='Polku', validators=[django.core.validators.RegexValidator(regex='[a-z0-9-/]+', message='Polku saa sisältää vain pieniä kirjaimia, numeroita, väliviivoja sekä kauttaviivoja.')])),
                ('title', models.CharField(help_text='Otsikko näytetään automaattisesti sivun ylälaidassa sekä valikossa. Älä lisää erillistä pääotsikkoa sivun tekstiin.', max_length=1023, verbose_name='Otsikko')),
                ('description', models.TextField(blank=True, help_text='Näkyy mm. hakukoneille sekä RSS-asiakasohjelmille.', verbose_name='Kuvaus', default='')),
                ('lft', models.PositiveIntegerField(db_index=True, editable=False)),
                ('rght', models.PositiveIntegerField(db_index=True, editable=False)),
                ('tree_id', models.PositiveIntegerField(db_index=True, editable=False)),
                ('level', models.PositiveIntegerField(db_index=True, editable=False)),
                ('parent', mptt.fields.TreeForeignKey(help_text='Tämä albumi luodaan valitun albumin alaisuuteen. Juurialbumilla ei ole yläalbumia.', related_name='subalbums', to='gallery.Album', blank=True, null=True, verbose_name='Yläalbumi')),
            ],
            options={
                'verbose_name_plural': 'Albumit',
                'verbose_name': 'Albumi',
            },
        ),
        migrations.CreateModel(
            name='Media',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, verbose_name='ID', serialize=False)),
                ('width', models.PositiveIntegerField(default=0)),
                ('height', models.PositiveIntegerField(default=0)),
                ('src', models.ImageField(null=True, max_length=255, height_field='height', width_field='width', upload_to='')),
            ],
            options={
                'verbose_name_plural': 'Media',
                'verbose_name': 'Media',
            },
        ),
        migrations.CreateModel(
            name='MediaSpec',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, verbose_name='ID', serialize=False)),
                ('max_width', models.PositiveIntegerField()),
                ('max_height', models.PositiveIntegerField()),
                ('quality', models.PositiveIntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Picture',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, verbose_name='ID', serialize=False)),
                ('slug', models.CharField(blank=True, help_text='Tekninen nimi eli "slug" näkyy URL-osoitteissa. Sallittuja merkkejä ovat pienet kirjaimet, numerot ja väliviiva. Jos jätät teknisen nimen tyhjäksi, se generoidaan automaattisesti otsikosta. Jos muutat teknistä nimeä julkaisun jälkeen, muista luoda tarvittavat uudelleenojaukset.', max_length=63, verbose_name='Tekninen nimi', validators=[django.core.validators.RegexValidator(regex='[a-z0-9-]+', message='Tekninen nimi saa sisältää vain pieniä kirjaimia, numeroita sekä väliviivoja.')])),
                ('order', models.IntegerField(help_text='Saman yläsivun alaiset sivut järjestetään valikossa tämän luvun mukaan nousevaan järjestykseen (pienin ensin).', verbose_name='Järjestys', default=0)),
                ('path', models.CharField(db_index=True, help_text='Polku määritetään automaattisesti teknisen nimen perusteella.', max_length=1023, verbose_name='Polku', validators=[django.core.validators.RegexValidator(regex='[a-z0-9-/]+', message='Polku saa sisältää vain pieniä kirjaimia, numeroita, väliviivoja sekä kauttaviivoja.')])),
                ('title', models.CharField(help_text='Otsikko näytetään automaattisesti sivun ylälaidassa sekä valikossa. Älä lisää erillistä pääotsikkoa sivun tekstiin.', max_length=1023, verbose_name='Otsikko')),
                ('description', models.TextField(blank=True, help_text='Näkyy mm. hakukoneille sekä RSS-asiakasohjelmille.', verbose_name='Kuvaus', default='')),
                ('album', models.ForeignKey(to='gallery.Album', related_name='pictures')),
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
            field=models.ForeignKey(to='gallery.Picture', related_name='media'),
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
