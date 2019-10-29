from django.conf import settings

from ..utils import pick_attrs


class AlbumMixin:
    def _make_breadcrumb(self):
        return pick_attrs(self,
            'path',
            'title',
        )

    def __str__(self):
        return self.path

    def get_absolute_url(self):
        return f'{settings.EDEGAL_FRONTEND_URL}{self.path}'

    def _make_thumbnail(self, format):
        # TODO what if the thumbnail is hidden?
        if self.cover_picture:
            return self.cover_picture.get_media('thumbnail', format=format).as_dict()
        else:
            return None
