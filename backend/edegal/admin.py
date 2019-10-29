import datetime
from os.path import splitext

from django.conf import settings
from django.contrib import admin
from django.db.models import Count
from django import forms

from ckeditor_uploader.widgets import CKEditorUploadingWidget
from multiupload.admin import MultiUploadAdmin

from .utils import slugify

from .models import (
    Album,
    Media,
    MediaSpec,
    Photographer,
    Picture,
    Series,
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
        widget=CKEditorUploadingWidget(),
        required=False,
        label=Album._meta.get_field('body').verbose_name,
        help_text=Album._meta.get_field('body').help_text,
    )
    date = forms.DateField(
        initial=lambda: datetime.date.today(),
        help_text=Album._meta.get_field('date').help_text,
    )

    class Meta:
        fields = (
            'body',
            'cover_picture',
            'date',
            'description',
            'director',
            'is_public',
            'is_visible',
            'layout',
            'parent',
            'photographer',
            'redirect_url',
            'slug',
            'terms_and_conditions',
            'title',
        )
        model = Album


def make_not_public_not_visible(modeladmin, request, queryset):
    return queryset.update(is_public=False, is_visible=False)
make_not_public_not_visible.short_description = 'Make not public, not visible'

def make_public_but_not_visible(modeladmin, request, queryset):
    return queryset.update(is_public=True, is_visible=False)
make_public_but_not_visible.short_description = 'Make public but not visible'

def make_public_and_visible(modeladmin, request, queryset):
    return queryset.update(is_public=True, is_visible=True)
make_public_and_visible.short_description = 'Make public and visible'


class AlbumAdmin(MultiUploadAdmin):
    model = Album
    form = AlbumAdminForm
    readonly_fields = ('path', 'created_at', 'updated_at', 'created_by')
    list_display = ('path', 'title', 'date', 'series', 'admin_get_num_pictures', 'is_public', 'is_visible')
    list_filter = ('series', 'is_public', 'is_visible', 'is_downloadable')
    raw_id_fields = ('cover_picture', 'terms_and_conditions', 'parent')
    search_fields = ('path', 'title')
    actions = [make_not_public_not_visible, make_public_but_not_visible, make_public_and_visible]
    fieldsets = [
        ('Basic info', {
            'fields': (
                'title',
                'date',
                'parent',
                'is_visible',
                'is_downloadable',
            )
        }),
        ('Credits', {
            'fields': (
                'photographer',
                'director',
                'terms_and_conditions',
            ),
        }),
        ('Text content', {
            'fields': (
                'description',
                'body',
            ),
        }),
        ('Technical details', {
            'classes': ('collapse',),
            'fields': (
                'series',
                'cover_picture',
                'slug',
                'path',
                'redirect_url',
                'layout',
                'is_public',
                'created_at',
                'updated_at',
                'created_by',
            )
        }),
    ]
    # inlines = (PictureInline,)
    multiupload_form = True
    multiupload_list = False
    multiupload_maxfilesize = settings.MAX_UPLOAD_SIZE
    multiupload_limitconcurrentuploads = settings.MAX_CONCURRENT_UPLOADS

    def save_model(self, request, obj, form, change):
        if obj.pk is None:
            if obj.created_by is None:
                obj.created_by = request.user

        return super().save_model(request, obj, form, change)

    def process_uploaded_file(self, uploaded, album, request):
        assert album is not None

        plain_name, extension = splitext(uploaded.name)

        picture, created = Picture.objects.get_or_create(
            slug=slugify(plain_name),
            album=album,
            defaults=dict(
                title=plain_name,
                created_by=request.user,
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
        try:
            photographer = request.user.photographer
            terms_and_conditions = photographer.default_terms_and_conditions
        except Photographer.DoesNotExist:
            photographer = None
            terms_and_conditions = None

        return dict(
            parent=Album.objects.filter(path='/').first(),
            photographer=photographer,
            terms_and_conditions=terms_and_conditions,
        )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(num_pictures=Count('pictures'))

    def admin_get_num_pictures(self, obj):
        return obj.num_pictures
    admin_get_num_pictures.short_description = 'Pictures'


class MediaInline(admin.TabularInline):
    model = Media
    extra = 0
    max_num = 0
    fields = ()
    readonly_fields = ('role', 'format', 'spec', 'width', 'height', 'file_size', 'src')
    can_delete = False
    show_change_link = False


class PictureAdmin(admin.ModelAdmin):
    model = Picture
    readonly_fields = ('path', 'created_at', 'updated_at', 'created_by')
    list_display = ('album', 'path', 'title')
    search_fields = ('path', 'title')
    raw_id_fields = ('album',)
    inlines = (MediaInline,)


def activate_media_specs(modeladmin, request, queryset):
    queryset.update(active=True)
activate_media_specs.short_description = 'Activate selected media specs'


def deactivate_media_specs(modeladmin, request, queryset):
    queryset.update(active=False)
deactivate_media_specs.short_description = 'Deactivate selected media specs'


class MediaSpecAdmin(admin.ModelAdmin):
    model = MediaSpec
    list_display = ('role', 'max_width', 'max_height', 'quality', 'format', 'active')
    readonly_fields = ('role', 'max_width', 'max_height', 'quality', 'format')
    actions = [activate_media_specs, deactivate_media_specs]


class PhotographerAdmin(admin.ModelAdmin):
    model = Photographer
    list_display = ('display_name', 'user', 'twitter_handle', 'instagram_handle', 'facebook_handle')
    raw_id_fields = ('default_terms_and_conditions', 'user', 'cover_picture')

    def get_changeform_initial_data(self, request):
        return dict(user=request.user)


class SeriesAdminForm(forms.ModelForm):
    body = forms.CharField(
        widget=CKEditorUploadingWidget(),
        required=False,
        label=Series._meta.get_field('body').verbose_name,
        help_text=Series._meta.get_field('body').help_text,
    )

    class Meta:
        fields = ('title', 'description', 'body', 'slug', 'is_public')
        model = Series


class SeriesAdmin(admin.ModelAdmin):
    model = Series
    form = SeriesAdminForm
    readonly_fields = ('path', 'created_at', 'updated_at', 'created_by')
    list_display = ('path', 'title', 'is_public', 'is_visible')

    def save_model(self, request, obj, form, change):
        if obj.pk is None and obj.created_by is None:
            obj.created_by = request.user

        return super().save_model(request, obj, form, change)


class TermsAndConditionsAdmin(admin.ModelAdmin):
    model = TermsAndConditions
    list_display = ('admin_get_abridged_text', 'url', 'user', 'is_public')
    fields = ('text', 'url', 'is_public', 'user')
    readonly_fields = ('digest',)
    search_fields = ('text', 'url')
    raw_id_fields = ('user',)
    filter_fields = ('is_public',)

    def get_changeform_initial_data(self, request):
        return dict(user=request.user)

    def get_queryset(self, request):
        return TermsAndConditions.get_for_user(request.user)


admin.site.register(Album, AlbumAdmin)
admin.site.register(MediaSpec, MediaSpecAdmin)
admin.site.register(Photographer, PhotographerAdmin)
admin.site.register(Picture, PictureAdmin)
admin.site.register(Series, SeriesAdmin)
admin.site.register(TermsAndConditions, TermsAndConditionsAdmin)

admin.site.site_header = 'Edegal Admin'
admin.site.site_title = 'Edegal Admin'
admin.site.index_title = ''
