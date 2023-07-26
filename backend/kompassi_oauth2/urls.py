from django.conf.urls import include

from .views import LoginView, CallbackView
from django.urls import re_path


urlpatterns = [
    re_path(r'^oauth2/login/?$', LoginView.as_view(), name='oauth2_login_view'),
    re_path(r'^oauth2/callback/?$', CallbackView.as_view(), name='oauth2_callback_view'),
]
