# Generated by Django 5.2.1 on 2025-06-02 20:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('edegal', '0027_alter_picture_album_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='photographer',
            name='bluesky_handle',
            field=models.CharField(blank=True, help_text='Full handle (eg. tracon.bsky.social) without the @ character', max_length=64),
        ),
        migrations.AddField(
            model_name='photographer',
            name='threads_handle',
            field=models.CharField(blank=True, max_length=30),
        ),
    ]
