from django.contrib import admin

from .models import (
    Album,
    Media,
    MediaSpec,
    Picture,
    TermsAndConditions,
)


class PictureInline(admin.TabularInline):
    model = Picture
    extra = 0
    max_num = 0
    fields = ('order',)
    readonly_fields = ('path', 'title')
    can_delete = True
    show_change_link = True
    verbose_name = 'kuvien järjestys'
    verbose_name_plural = 'kuvien järjestys'


class AlbumAdmin(admin.ModelAdmin):
    model = Album
    readonly_fields = ('path',)
    list_display = ('path', 'title')
    raw_id_fields = ('cover_picture',)
    inlines = (PictureInline,)


class MediaInline(admin.TabularInline):
    model = Media
    extra = 0
    max_num = 0
    fields = ()
    readonly_fields = ('spec', 'width', 'height', 'src')
    can_delete = False
    show_change_link = False


class PictureAdmin(admin.ModelAdmin):
    model = Picture
    readonly_fields = ('path',)
    list_display = ('album', 'path', 'title')
    inlines = (MediaInline,)


class MediaSpecAdmin(admin.ModelAdmin):
    model = MediaSpec
    list_display = ('max_width', 'max_height', 'quality')
    fields = ('is_default_thumbnail',)
    readonly_fields = ('max_width', 'max_height', 'quality')


class TermsAndConditionsAdmin(admin.ModelAdmin):
    model = TermsAndConditions
    list_display = ('admin_get_abridged_text', 'url', 'is_public')
    fields = ('text', 'url', 'is_public')
    readonly_fields = ('digest',)


admin.site.register(Album, AlbumAdmin)
admin.site.register(Picture, PictureAdmin)
admin.site.register(MediaSpec, MediaSpecAdmin)
admin.site.register(TermsAndConditions, TermsAndConditionsAdmin)
