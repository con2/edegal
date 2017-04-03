from django.conf.urls import url

from .views import ApiV2View

urlpatterns = [
    url(r'^api/v2(?P<path>[a-z0-9/-]+)$', ApiV2View.as_view(), name='api_v2_view'),
]
