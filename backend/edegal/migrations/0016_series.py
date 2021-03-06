# -*- coding: utf-8 -*-
# Generated by Django 1.11.21 on 2019-06-15 15:37
from __future__ import unicode_literals

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import edegal.models.album_mixin


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('edegal', '0015_album_layout'),
    ]

    operations = [
        migrations.CreateModel(
            name='Series',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(help_text='The title will be displayed at the top of the view.', max_length=1023, verbose_name='Title')),
                ('slug', models.CharField(blank=True, help_text='The slug will be included as part of the URL. The slug may only contain lower case letters (a–z), numbers (0–9) and dashes (-). If you leave the slug blank, it will be generated from the title. If you change the slug after publishing, remember to create any redirects you may need.', max_length=255, validators=[django.core.validators.RegexValidator(message='The slug may only contain lower case letters (a–z), numbers (0–9) and dashes (-).', regex='[a-z0-9-]+')], verbose_name='Slug')),
                ('description', models.TextField(blank=True, default='', help_text='While the description is not usually displayed in the user interface, it is visible to search engines and RSS readers. If your item contains text content, a good practice is to make the description a short summary of the content.', verbose_name='Description')),
                ('body', models.TextField(blank=True, default='', help_text='Will be displayed at the top of the album view before subalbums and pictures.', verbose_name='Text content')),
                ('is_public', models.BooleanField(default=True, help_text='Items that are not public are only accessible to admin users.', verbose_name='Public')),
                ('is_visible', models.BooleanField(default=True, help_text='Items that are not visible are not displayed in listings, but they can still be accessed via exact URL.', verbose_name='Visible')),
                ('path', models.CharField(help_text='Will be automatically determined from parent and slug.', max_length=1023, unique=True, validators=[django.core.validators.RegexValidator(message='The path may only contain lower case letters (a–z), numbers (0–9), dashes (-) and forward slashes (/).', regex='[a-z0-9-/]+')], verbose_name='Path')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            bases=(edegal.models.album_mixin.AlbumMixin, models.Model),
        ),
        migrations.AddField(
            model_name='album',
            name='previous_in_series',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to='edegal.Album'),
        ),
        migrations.AddField(
            model_name='album',
            name='next_in_series',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to='edegal.Album'),
        ),
        migrations.AlterField(
            model_name='album',
            name='created_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='album',
            name='date',
            field=models.DateField(help_text='When did the events portrayed in this album happen? Note that this may differ from album creation date which is tracked automatically.', null=True),
        ),
        migrations.AlterField(
            model_name='album',
            name='terms_and_conditions',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='edegal.TermsAndConditions'),
        ),
        migrations.AddField(
            model_name='album',
            name='series',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='albums', to='edegal.Series'),
        ),
    ]
