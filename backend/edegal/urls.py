from django.conf.urls import url

from .views import api_v2_view

urlpatterns = [
    url(r'^api/v2(?P<path>[a-z0-9/-]+)$', api_v2_view, name='api_v2_view'),
]
