from django.conf.urls import url

from .views import api_v3_view

urlpatterns = [
    url(r'^api/v3(?P<path>[a-z0-9/-]+?)/?$', api_v3_view, name='api_v3_view'),
]
