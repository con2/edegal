from os.path import splitext

from django.conf import settings
from django.contrib import admin
from django import forms

from ckeditor.widgets import CKEditorWidget
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
    fields = ('order', 'title')
    readonly_fields = ('path',)
    can_delete = True
    show_change_link = True


class AlbumAdminForm(forms.ModelForm):
    body = forms.CharField(
        widget=CKEditorWidget(),
        required=False,
        label=Album._meta.get_field('body').verbose_name,
        help_text=Album._meta.get_field('body').help_text,
    )

    class Meta:
        fields = ('title', 'description', 'body', 'cover_picture', 'terms_and_conditions', 'parent', 'slug', 'is_public')
        model = Album


class AlbumAdmin(MultiUploadAdmin):
    model = Album
    form = AlbumAdminForm
    readonly_fields = ('path',)
    list_display = ('path', 'title')
    raw_id_fields = ('cover_picture', 'terms_and_conditions', 'parent')
    search_fields = ('path', 'title')
    inlines = (PictureInline,)
    multiupload_form = True
    multiupload_list = False
    multiupload_maxfilesize = settings.MAX_UPLOAD_SIZE

    def process_uploaded_file(self, uploaded, album, request):
        assert album is not None

        plain_name, extension = splitext(uploaded.name)

        picture, created = Picture.objects.get_or_create(
            slug=slugify(plain_name),
            album=album,
            defaults=dict(
                title=plain_name,
            )
        )

        Media.import_open_file(picture, uploaded.file, refresh_album=True)

        return dict(
            url='',  # FIXME
            thumbnail_url='',  # FIXME
            id=picture.id,
            name=picture.title
        )

    def get_changeform_initial_data(self, request):
        return dict(parent=Album.objects.filter(path='/').first())


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
    search_fields = ('text', 'url')


admin.site.register(Album, AlbumAdmin)
admin.site.register(Picture, PictureAdmin)
admin.site.register(MediaSpec, MediaSpecAdmin)
admin.site.register(TermsAndConditions, TermsAndConditionsAdmin)
