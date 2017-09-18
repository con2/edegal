from django.http import JsonResponse
from django.views.generic.base import View

from .models import Album


class ApiV2View(View):
    http_method_names = ['get', 'head']

    def get(self, request, path):
        if path == '':
            path = '/'

        extra_criteria = dict()
        if not request.user.is_staff:
            extra_criteria.update(is_public=True)

        album = Album.get_album_by_path(path, or_404=True, **extra_criteria)
        return JsonResponse(album.as_dict(include_hidden=request.user.is_staff))


api_v2_view = ApiV2View.as_view()
