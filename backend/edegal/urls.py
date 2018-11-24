from django.conf.urls import url

from .views import api_v3_view, status_view

urlpatterns = [
    url(r'^api/v3/status/?$', status_view, name='status_view'),
    url(r'^api/v3(?P<path>[a-z0-9/-]+?)/?$', api_v3_view, name='api_v3_view'),
]
