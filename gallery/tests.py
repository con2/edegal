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

        print('root', root.path)


        album1, unused = Album.objects.get_or_create(
            path='album1',
            defaults=dict(
                title='Album, the First of his Name',
                slug='album-1',
                parent=root,
            )
        )

        print('album1', album1.path)

        album2, unused = Album.objects.get_or_create(
            path='album-2',
            defaults=dict(
                title='Album 2',
                parent=root,
            )
        )

        picture1, unused = Picture.objects.get_or_create(
            path='album-1/picture-1',
            defaults=dict(
                title='Picture 1',
                album=album2,
            )
        )

        picture2, unused = Picture.objects.get_or_create(
            path='album-1/picture-2',
            defaults=dict(
                title='Picture 2',
                album=album2,
            )
        )

        print(Album.objects.all())

    def test_get_album_by_path(self):
        album = Album.get_album_by_path('/album-1')
        assert album.path == 'album-1'

        album = Album.get_album_by_path('album-2/picture-2')
        assert album.path == 'album-2'
