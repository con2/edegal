from django.urls import re_path

from .views import CallbackView, LoginView

urlpatterns = [
    re_path(r"^oauth2/login/?$", LoginView.as_view(), name="oauth2_login_view"),
    re_path(r"^oauth2/callback/?$", CallbackView.as_view(), name="oauth2_callback_view"),
]
