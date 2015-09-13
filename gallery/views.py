from django.shortcuts import render
from django.views.generic.base import View


class EdegalV2ApiView(View):
    http_method_names = ['get', 'head']

    def get(self, request, path):
        album = Album.get_album_by_path(path)
        return JSONResponse(album.as_dict())
