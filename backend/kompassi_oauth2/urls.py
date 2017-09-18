from django.conf.urls import include, url

from .views import LoginView, CallbackView


urlpatterns = [
    url(r'^oauth2/login/?$', LoginView.as_view(), name='oauth2_login_view'),
    url(r'^oauth2/callback/?$', CallbackView.as_view(), name='oauth2_callback_view'),
]
