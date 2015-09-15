from django.views.generic.base import View
from django.http import JsonResponse

from .models import Album


class ApiV2View(View):
    http_method_names = ['get', 'head']

    def get(self, request, path):
        if path == '':
            path = '/'

        album = Album.get_album_by_path(path)
        return JsonResponse(album.as_dict())
