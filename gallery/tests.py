from django.test import TestCase

from .models import Album, Picture


class AlbumTestCase(TestCase):
    def setUp(self):
        root, unused = Album.objects.get_or_create(
            path='',
            defaults=dict(
                title='My Swell Picture Gallery',
            ),
        )

        album1, unused = Album.objects.get_or_create(
            path='/album-1',
            defaults=dict(
                title='Album, the First of his Name',
                slug='album-1',
                parent=root,
            )
        )

        album2, unused = Album.objects.get_or_create(
            path='/album-2',
            defaults=dict(
                title='Album 2',
                parent=root,
            )
        )

        picture1, unused = Picture.objects.get_or_create(
            path='/album-1/picture-1',
            defaults=dict(
                title='Picture 1',
                album=album2,
            )
        )

        picture2, unused = Picture.objects.get_or_create(
            path='/album-1/picture-2',
            defaults=dict(
                title='Picture 2',
                album=album2,
            )
        )

    def test_get_album_by_path(self):
        album = Album.get_album_by_path('/album-1')
        self.assertEqual(album.path, '/album-1')

        album = Album.get_album_by_path('/album-2/picture-2')
        self.assertEqual(album.path, '/album-2')

    def test_as_dict(self):
        album = Album.get_album_by_path('/album-2')
        print(album.as_dict())
        assert False
