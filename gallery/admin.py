from django.contrib import admin

from .models import (
    Album,
    Media,
    MediaSpec,
    Picture,
)


class MediaInline(admin.StackedInline):
    model = Media


class PictureInline(admin.StackedInline):
    model = Picture
    inlines = (MediaInline,)
    extra = 0


class AlbumAdmin(admin.ModelAdmin):
    model = Album
    readonly_fields = ('path',)
    list_display = ('path', 'title')
    inlines = (PictureInline,)


admin.site.register(Album, AlbumAdmin)
