
from .views import api_v3_view, status_view, photographers_api_v3_view, photographer_api_v3_view, random_picture_api_v3_view
from django.urls import re_path

urlpatterns = [
    re_path(r'^api/v3/status/?$', status_view, name='status_view'),
    re_path(r'^api/v3/photographers/?$', photographers_api_v3_view, name='photographers_api_v3_view'),
    re_path(r'^api/v3/photographers/(?P<photographer_slug>[a-z0-9-]+?)/?$', photographer_api_v3_view, name='photographer_api_v3_view'),
    re_path(r'^api/v3/random/?$', random_picture_api_v3_view, name='random_picture_api_v3_view'),
    re_path(r'^api/v3(?P<path>[a-z0-9/-]+?)/?$', api_v3_view, name='api_v3_view'),
]
