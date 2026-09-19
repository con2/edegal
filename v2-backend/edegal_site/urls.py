from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve as serve_static

urlpatterns = [
    path("", include("edegal.urls")),
]


if settings.EDEGAL_USE_KOMPASSI_OAUTH2:
    urlpatterns.append(path("admin/", include("kompassi_oauth2.urls")))


# must be after kompassi_oauth2 as we mount it under /admin to pass proxy
urlpatterns.append(path("admin/", admin.site.urls))


if settings.DEBUG:
    urlpatterns.extend(
        (
            re_path(
                r"^media/(?P<path>.*)$",
                serve_static,
                {"document_root": settings.MEDIA_ROOT},
            ),
        )
    )
