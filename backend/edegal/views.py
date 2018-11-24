from django.http import JsonResponse
from django.views.generic.base import View

from .models import Album
from .models.media_spec import FORMAT_CHOICES


SUPPORTED_FORMATS = {format for (format, disp) in FORMAT_CHOICES}


class StatusView(View):
    def get(self, request):
        return JsonResponse(dict(status='OK'))


class ApiV3View(View):
    http_method_names = ['get', 'head']

    def get(self, request, path):
        if path == '':
            path = '/'

        format = request.GET.get('format', 'jpeg').lower()
        if format == 'jpg':
            format = 'jpeg'
        if format not in SUPPORTED_FORMATS:
            return JsonResponse({
                "status": 400,
                "message": "unsupported format (try jpeg or webp)",
            }, status=400)

        extra_criteria = dict()
        if not request.user.is_staff:
            extra_criteria.update(is_public=True)

        album = Album.get_album_by_path(path, or_404=True, **extra_criteria)
        return JsonResponse(album.as_dict(
            include_hidden=request.user.is_staff,
            format=format,
        ))


api_v3_view = ApiV3View.as_view()
status_view = StatusView.as_view()
