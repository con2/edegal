from django.conf import settings
from django.conf.urls import include, url
from django.contrib import admin


urlpatterns = [
    url(r'', include('gallery.urls')),
    url(r'^admin/', include(admin.site.urls)),
]

if settings.DEBUG:
    urlpatterns.extend((
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT}),
        url(r'', 'django.contrib.staticfiles.views.serve', dict(path='gallery/index.html')),
    ))
