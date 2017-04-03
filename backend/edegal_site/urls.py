from django.conf import settings
from django.conf.urls import include, url
from django.contrib import admin
from django.views.static import serve as serve_static
from django.contrib.staticfiles.views import serve as serve_staticfiles


urlpatterns = [
    url(r'', include('edegal.urls')),
    url(r'^admin/', include(admin.site.urls)),
]

if settings.DEBUG:
    urlpatterns.extend((
        url(r'^media/(?P<path>.*)$', serve_static, {'document_root': settings.MEDIA_ROOT}),
        url(r'', serve_staticfiles, dict(path='edegal/index.html')),
    ))
