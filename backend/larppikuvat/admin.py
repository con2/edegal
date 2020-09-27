from django.contrib import admin
from django import forms

from ckeditor_uploader.widgets import CKEditorUploadingWidget

from .models import LarppikuvatPhotographerProfile


class LarppikuvatPhotographerProfileForm(forms.ModelForm):
    contact = forms.CharField(
        widget=CKEditorUploadingWidget(),
        required=False,
        label=LarppikuvatPhotographerProfile._meta.get_field('contact').verbose_name,
        help_text=LarppikuvatPhotographerProfile._meta.get_field('contact').help_text,
    )

    delivery_method = forms.CharField(
        widget=CKEditorUploadingWidget(),
        required=False,
        label=LarppikuvatPhotographerProfile._meta.get_field('delivery_method').verbose_name,
        help_text=LarppikuvatPhotographerProfile._meta.get_field('delivery_method').help_text,
    )

    copy_protection = forms.CharField(
        widget=CKEditorUploadingWidget(),
        required=False,
        label=LarppikuvatPhotographerProfile._meta.get_field('copy_protection').verbose_name,
        help_text=LarppikuvatPhotographerProfile._meta.get_field('copy_protection').help_text,
    )

    class Meta:
        fields = (
            "contact",
            "hours",
            "delivery_schedule",
            "delivery_practice",
            "delivery_method",
            "copy_protection",
            "expected_compensation",
        )
        model = LarppikuvatPhotographerProfile



class LarppikuvatPhotographerProfileInlineAdmin(admin.StackedInline):
    model = LarppikuvatPhotographerProfile
    form = LarppikuvatPhotographerProfileForm