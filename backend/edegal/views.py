from django.http import JsonResponse
from django.views.decorators.cache import cache_page
from django.views.generic.base import View

from .models import Album


CACHE_SECONDS = 5 * 60


class ApiV2View(View):
    http_method_names = ['get', 'head']

    def get(self, request, path):
        if path == '':
            path = '/'

        extra_criteria = dict()
        if not request.user.is_staff:
            extra_criteria.update(is_public=True)

        album = Album.get_album_by_path(path, or_404=True, **extra_criteria)
        return JsonResponse(album.as_dict())


api_v2_view = ApiV2View.as_view()
# api_v2_view = cache_page(CACHE_SECONDS)(ApiV2View.as_view())
