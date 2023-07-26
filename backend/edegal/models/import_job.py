from django.db import models

from .common import validate_path


def get_root_album():
    from .album import Album

    return Album.objects.get(path="/")


class ImportJob(models.Model):
    """
    Represents an import job that may have multiple import sources.
    At the moment only Flickr albums are supported.
    """

    parent_album = models.ForeignKey(
        "edegal.Album",
        on_delete=models.CASCADE,
        related_name="import_jobs",
        help_text="Imported albums will be created under this album. In the larppikuvat.fi convention, leave this as the root album.",
        default=get_root_album,
    )
    user_input = models.TextField(
        help_text="URLs to import, one per line. At the moment only Flickr albums are supported."
    )
    leaf_album_title = models.CharField(
        help_text=(
            "If set, imported albums will have a two-level hierarchy with the parent album title derived "
            "from the name of the imported album and the leaf album having this name. "
            "If unset, the imported album will be created directly under the parent album with its original title. "
            "In the larppikuvat.fi convention, set this to the name of the photographer."
        ),
        max_length=1023,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    created_by = models.ForeignKey(
        "auth.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="import_jobs",
    )

    def __str__(self):
        return f"{self.created_at} ({self.created_by})"

    @staticmethod
    def post_save(sender, instance, created, **kwargs):
        """
        Create an ImportItem for each line in the user_input field if it doesn't exist already.
        Those that didn't exist are marked as pending and queued for execution.
        Connected in ../apps.py.
        """
        from .import_item import ImportItem

        for line in instance.user_input.splitlines():
            line = line.strip()

            if "flickr.com" in line:
                source_type = "flickr"
                status = "pending"
            else:
                source_type = "unknown"
                status = "error"

            item, created = ImportItem.objects.get_or_create(
                import_job=instance,
                source_id=line,
                defaults=dict(
                    source_type=source_type,
                    status=status,
                ),
            )

            if created:
                item.run()
