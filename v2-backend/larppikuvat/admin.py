from django import forms
from django.contrib import admin

from .models import LarppikuvatPhotographerProfile


class LarppikuvatPhotographerProfileForm(forms.ModelForm):
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
