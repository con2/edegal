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
