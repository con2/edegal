import datetime
from os.path import splitext
from typing import Optional

from django import forms
from django.conf import settings
from django.contrib import admin
from django.db.models import Count
from django.http.request import HttpRequest
from multiupload.admin import MultiUploadAdmin

from .models import (
    Album,
    ImportItem,
    ImportJob,
    Media,
    MediaSpec,
    Photographer,
    Picture,
    Series,
    TermsAndConditions,
)
from .utils import slugify


class PictureInline(admin.TabularInline):
    model = Picture
    extra = 0
    max_num = 0
    fields = ("order", "title")
    readonly_fields = ("path",)
    can_delete = True
    show_change_link = True


class AlbumAdminForm(forms.ModelForm):
    date = forms.DateField(
        initial=lambda: datetime.date.today(),
        help_text=Album._meta.get_field("date").help_text,
    )

    class Meta:
        fields = (
            "body",
            "cover_picture",
            "date",
            "description",
            "director",
            "is_public",
            "is_visible",
            "layout",
            "parent",
            "photographer",
            "redirect_url",
            "slug",
            "terms_and_conditions",
            "title",
        )
        model = Album


@admin.action(description="Make not public, not visible")
def make_not_public_not_visible(modeladmin, request, queryset):
    return queryset.update(is_public=False, is_visible=False)


@admin.action(description="Make public but not visible")
def make_public_but_not_visible(modeladmin, request, queryset):
    return queryset.update(is_public=True, is_visible=False)


@admin.action(description="Make public and visible")
def make_public_and_visible(modeladmin, request, queryset):
    return queryset.update(is_public=True, is_visible=True)


@admin.register(Album)
class AlbumAdmin(MultiUploadAdmin):
    model = Album
    form = AlbumAdminForm
    readonly_fields = ("path", "created_at", "updated_at", "created_by")
    list_display = (
        "path",
        "title",
        "date",
        "series",
        "admin_get_num_pictures",
        "is_public",
        "is_visible",
    )
    list_filter = ("series", "is_public", "is_visible", "is_downloadable")
    raw_id_fields = ("cover_picture", "terms_and_conditions", "parent")
    search_fields = ("path", "title")
    actions = [
        make_not_public_not_visible,
        make_public_but_not_visible,
        make_public_and_visible,
    ]
    fieldsets = [
        (
            "Basic info",
            {
                "fields": (
                    "title",
                    "date",
                    "parent",
                    "is_visible",
                    "is_downloadable",
                )
            },
        ),
        (
            "Credits",
            {
                "fields": (
                    "photographer",
                    "director",
                    "terms_and_conditions",
                ),
            },
        ),
        (
            "Text content",
            {
                "fields": (
                    "description",
                    "body",
                ),
            },
        ),
        (
            "Technical details",
            {
                "classes": ("collapse",),
                "fields": (
                    "series",
                    "cover_picture",
                    "slug",
                    "path",
                    "redirect_url",
                    "layout",
                    "is_public",
                    "created_at",
                    "updated_at",
                    "created_by",
                ),
            },
        ),
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
            ),
        )

        Media.import_open_file(picture, uploaded.file, refresh_album=True)

        return dict(
            url="", thumbnail_url="", id=picture.id, name=picture.title
        )  # FIXME  # FIXME

    def get_changeform_initial_data(self, request):
        try:
            photographer = request.user.photographer
            terms_and_conditions = photographer.default_terms_and_conditions
        except Photographer.DoesNotExist:
            photographer = None
            terms_and_conditions = None

        return dict(
            parent=Album.objects.filter(path="/").first(),
            photographer=photographer,
            terms_and_conditions=terms_and_conditions,
        )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(num_pictures=Count("pictures"))

    @admin.display(description="Pictures")
    def admin_get_num_pictures(self, obj):
        return obj.num_pictures


class MediaInline(admin.TabularInline):
    model = Media
    extra = 0
    max_num = 0
    fields = ()
    readonly_fields = ("role", "format", "spec", "width", "height", "file_size", "src")
    can_delete = False
    show_change_link = False


@admin.register(Picture)
class PictureAdmin(admin.ModelAdmin):
    model = Picture
    readonly_fields = ("path", "taken_at", "created_at", "updated_at", "created_by")
    list_display = ("album", "path", "title")
    search_fields = ("path", "title")
    raw_id_fields = ("album",)
    inlines = (MediaInline,)


@admin.action(description="Activate selected media specs")
def activate_media_specs(modeladmin, request, queryset):
    queryset.update(active=True)


@admin.action(description="Deactivate selected media specs")
def deactivate_media_specs(modeladmin, request, queryset):
    queryset.update(active=False)


@admin.register(MediaSpec)
class MediaSpecAdmin(admin.ModelAdmin):
    model = MediaSpec
    list_display = ("role", "max_width", "max_height", "quality", "format", "active")
    readonly_fields = ("role", "max_width", "max_height", "quality", "format")
    actions = [activate_media_specs, deactivate_media_specs]


class PhotographerAdminForm(forms.ModelForm):
    class Meta:
        model = Photographer
        fields = (
            "display_name",
            "slug",
            "user",
            "email",
            "twitter_handle",
            "instagram_handle",
            "facebook_handle",
            "flickr_handle",
            "default_terms_and_conditions",
            "body",
            "cover_picture",
        )


photographer_inlines = []

if "larppikuvat" in settings.INSTALLED_APPS:
    from larppikuvat.admin import LarppikuvatPhotographerProfileInlineAdmin

    photographer_inlines.append(LarppikuvatPhotographerProfileInlineAdmin)


@admin.register(Photographer)
class PhotographerAdmin(admin.ModelAdmin):
    model = Photographer
    form = PhotographerAdminForm
    list_display = (
        "display_name",
        "user",
        "twitter_handle",
        "instagram_handle",
        "facebook_handle",
        "flickr_handle",
    )
    raw_id_fields = ("default_terms_and_conditions", "user", "cover_picture")
    inlines = photographer_inlines

    def get_changeform_initial_data(self, request):
        return dict(user=request.user)


class SeriesAdminForm(forms.ModelForm):
    class Meta:
        fields = ("title", "description", "body", "slug", "is_public")
        model = Series


@admin.register(Series)
class SeriesAdmin(admin.ModelAdmin):
    model = Series
    form = SeriesAdminForm
    readonly_fields = ("path", "created_at", "updated_at", "created_by")
    list_display = ("path", "title", "is_public", "is_visible")

    def save_model(self, request, obj, form, change):
        if obj.pk is None and obj.created_by is None:
            obj.created_by = request.user

        return super().save_model(request, obj, form, change)


@admin.register(TermsAndConditions)
class TermsAndConditionsAdmin(admin.ModelAdmin):
    model = TermsAndConditions
    list_display = ("admin_get_abridged_text", "url", "user", "is_public")
    fields = ("text", "url", "is_public", "user")
    readonly_fields = ("digest",)
    search_fields = ("text", "url")
    raw_id_fields = ("user",)
    filter_fields = ("is_public",)

    def get_changeform_initial_data(self, request):
        return dict(user=request.user)

    def get_queryset(self, request):
        return TermsAndConditions.get_for_user(request.user)


class ImportItemInline(admin.TabularInline):
    model = ImportItem
    extra = 0
    readonly_fields = ("source_id", "source_type", "status", "album")

    def has_delete_permission(self, request, obj):
        return False


@admin.register(ImportJob)
class ImportJobAdmin(admin.ModelAdmin):
    model = ImportJob
    inlines = (ImportItemInline,)
    raw_id_fields = ("parent_album",)
    readonly_fields = ("created_at", "updated_at", "created_by")
    list_display = ("created_at", "created_by")

    def save_model(self, request, obj, form, change):
        import_job = obj

        if import_job.created_by is None:
            import_job.created_by = request.user

        import_job.save()

    def get_changeform_initial_data(self, request):
        try:
            return dict(leaf_album_title=request.user.photographer.display_name)
        except Photographer.DoesNotExist:
            return dict()

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False


admin.site.site_header = "Edegal Admin"
admin.site.site_title = "Edegal Admin"
admin.site.index_title = ""
