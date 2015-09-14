from django.test import TestCase

from .models import Album, Picture, MediaSpec, Media


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

        original_media, unused = Media.objects.get_or_create(
            picture=picture1,
            spec=None,
            defaults=dict(
                width=800,
                height=600,
            )
        )

        spec, unused = MediaSpec.objects.get_or_create(
            max_width=640,
            max_height=480,
            quality=60,
        )

        derived_media, unused = Media.objects.get_or_create(
            picture=picture1,
            spec=spec,
            defaults=dict(
                width=spec.max_width,
                height=spec.max_height,
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

    def test_canonical_path(self):
        picture1 = Picture.objects.get(path='/album-2/picture-1')

        original = picture1.get_original()
        self.assertEqual(original.get_canonical_path(), 'pictures/album-2/picture-1.jpg')

        derived = picture1.media.get(spec__max_width=640, spec__max_height=480)
        self.assertEqual(derived.get_canonical_path(), 'previews/album-2/picture-1/640x480q60.jpg')
