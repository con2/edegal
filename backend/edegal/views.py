from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.generic.base import View

from .models import Album, Photographer, Picture
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
        response = JsonResponse(album.as_dict(
            include_hidden=request.user.is_staff,
            format=format,
        ))

        download = request.GET.get('download', 'false')
        if download.lower() not in ('false', 'no', '0'):
            album.ensure_download()

        return response


class PhotographersApiV3View(View):
    http_method_names = ['get', 'head']

    def get(self, request):
        format = request.GET.get('format', 'jpeg').lower()
        if format == 'jpg':
            format = 'jpeg'
        if format not in SUPPORTED_FORMATS:
            return JsonResponse({
                "status": 400,
                "message": "unsupported format (try jpeg or webp)",
            }, status=400)

        pseudoalbum = Album.objects.filter(path='/photographers').first()

        return JsonResponse(dict(
            path='/photographers',
            title='Photographers',
            body=pseudoalbum.body if pseudoalbum else '',
            subalbums=[
                photog.make_subalbum(format=format)
                for photog in Photographer.objects.filter(cover_picture__isnull=False)
            ],
            pictures=[],
            breadcrumb=[
                Album.objects.get(path='/')._make_breadcrumb(),
            ],
            redirect_url='',
            is_downloadable=False,
            download_url='',
            date='',
            layout='simple',
            credits={},
        ))


class PhotographerApiV3View(View):
    http_method_names = ['get', 'head']

    def get(self, request, photographer_slug):
        photographer = get_object_or_404(Photographer, slug=photographer_slug)

        format = request.GET.get('format', 'jpeg').lower()
        if format == 'jpg':
            format = 'jpeg'
        if format not in SUPPORTED_FORMATS:
            return JsonResponse({
                "status": 400,
                "message": "unsupported format (try jpeg or webp)",
            }, status=400)

        return JsonResponse(photographer.make_album(format=format))


class RandomPictureAPIV3View(View):
    http_method_names = ['get', 'head']

    def get(self, request):
        picture = Picture.get_random_picture()

        response = JsonResponse(Album.fake_album_as_dict(
            path='/random',
            title='Random Picture',
            redirect_url=picture.path,
        ))
        response['Cache-Control'] = 'no-store'

        return response


api_v3_view = ApiV3View.as_view()
photographers_api_v3_view = PhotographersApiV3View.as_view()
photographer_api_v3_view = PhotographerApiV3View.as_view()
random_picture_api_v3_view = RandomPictureAPIV3View.as_view()
status_view = StatusView.as_view()
