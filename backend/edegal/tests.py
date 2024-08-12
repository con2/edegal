from uuid import uuid4

from django.test import TestCase

from .models import Album, Media, MediaSpec, Picture


class AlbumTestCase(TestCase):
    def setUp(self):
        root, unused = Album.objects.get_or_create(
            path="",
            defaults=dict(
                title="My Swell Picture Gallery",
            ),
        )

        album1, unused = Album.objects.get_or_create(
            path="/album-1",
            defaults=dict(
                title="Album, the First of his Name",
                slug="album-1",
                parent=root,
            ),
        )

        album2, unused = Album.objects.get_or_create(
            path="/album-2",
            defaults=dict(
                title="Album 2",
                parent=root,
            ),
        )

        picture1, unused = Picture.objects.get_or_create(
            path="/album-1/picture-1",
            defaults=dict(
                title="Picture 1",
                album=album2,
            ),
        )

        picture2, unused = Picture.objects.get_or_create(
            path="/album-1/picture-2",
            defaults=dict(
                title="Picture 2",
                album=album2,
            ),
        )

        original_media, unused = Media.objects.get_or_create(
            picture=picture1,
            spec=None,
            defaults=dict(
                src=str(uuid4()),
                role="original",
                width=800,
                height=600,
            ),
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
                src=str(uuid4()),
                role="thumbnail",
                width=spec.max_width,
                height=spec.max_height,
            ),
        )

    def test_get_album_by_path(self):
        album = Album.get_album_by_path("/album-1")
        self.assertEqual(album.path, "/album-1")

        album = Album.get_album_by_path("/album-2/picture-2")
        self.assertEqual(album.path, "/album-2")

    def test_as_dict(self):
        album = Album.get_album_by_path("/album-2")
        print(album.as_dict())

    def test_canonical_path(self):
        picture1 = Picture.objects.get(path="/album-2/picture-1")

        original = picture1.original
        self.assertEqual(
            original.get_canonical_path(prefix=""), "pictures/album-2/picture-1.jpeg"
        )

        derived = picture1.media.get(spec__max_width=640, spec__max_height=480)
        self.assertEqual(
            derived.get_canonical_path(prefix=""),
            "previews/album-2/picture-1.thumbnail.jpeg",
        )

    def test_resolve_redirects(self):
        """
        If an upstream album has a redirect URL to another album in this gallery,
        handle its descendants as if they were in the target album.
        """
        root_album = Album.objects.get(path="/")

        Album.objects.create(
            title="Album 3",
            redirect_url="/album-4",
            parent=root_album,
        )

        album4 = Album.objects.create(
            title="Album 4",
            parent=root_album,
        )

        child_album = Album.objects.create(
            title="Child Album",
            parent=album4,
        )

        Picture.objects.create(
            album=child_album,
            title="Picture",
        )

        album_dict = Album.resolve_upstream_redirects("/album-3/child-album")
        assert album_dict is not None
        self.assertEqual(album_dict["redirect_url"], "/album-4/child-album")

        album_dict = Album.resolve_upstream_redirects("/album-3/child-album/picture")
        assert album_dict is not None
        self.assertEqual(album_dict["redirect_url"], "/album-4/child-album/picture")
