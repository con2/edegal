from django.conf import settings
from django.conf.urls import include, url
from django.contrib import admin
from django.views.static import serve as serve_static


urlpatterns = [
    url(r'', include('edegal.urls')),
]


if settings.EDEGAL_USE_KOMPASSI_OAUTH2:
    urlpatterns.append(url(r'^admin/', include('kompassi_oauth2.urls')))


# must be after kompassi_oauth2 as we mount it under /admin to pass proxy
urlpatterns.append(url(r'^admin/', include(admin.site.urls)))


if settings.DEBUG:
    urlpatterns.extend((
        url(r'^media/(?P<path>.*)$', serve_static, {'document_root': settings.MEDIA_ROOT}),
    ))
