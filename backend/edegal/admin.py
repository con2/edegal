from django.contrib import admin

from multiupload.admin import MultiUploadAdmin

from .utils import slugify


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


class AlbumAdmin(MultiUploadAdmin):
    model = Album
    readonly_fields = ('path',)
    list_display = ('path', 'title')
    raw_id_fields = ('cover_picture',)
    inlines = (PictureInline,)
    multiupload_form = True
    multiupload_list = False

    def process_uploaded_file(self, uploaded, album, request):
        assert album is not None

        picture, created = Picture.objects.get_or_create(
            slug=slugify(uploaded.name),
            album=album,
            defaults=dict(
                title=uploaded.name,
            )
        )

        Media.import_open_file(picture, uploaded.file)

        return dict(
            url='',  # FIXME
            thumbnail_url='',  # FIXME
            id=picture.id,
            name=picture.title
        )


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
