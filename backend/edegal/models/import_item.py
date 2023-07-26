from django.db import models


IMPORT_STATUS_CHOICES = [
    ("pending", "Pending"),
    ("running", "Running"),
    ("done", "Done"),
    ("error", "Error"),
]

SOURCE_TYPE_CHOICES = [
    ("unknown", "Unknown"),
    ("flickr", "Flickr album"),
]


class ImportItem(models.Model):
    """
    See ImportJob.
    """

    import_job = models.ForeignKey("edegal.ImportJob", on_delete=models.CASCADE)
    source_id = models.CharField(max_length=1023)
    album = models.ForeignKey(
        "edegal.Album",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="The album that was created for this import item.",
    )
    source_type = models.CharField(
        max_length=max(len(it) for (it, _) in SOURCE_TYPE_CHOICES),
        choices=SOURCE_TYPE_CHOICES,
    )
    status = models.CharField(
        max_length=max(len(it) for (it, _) in IMPORT_STATUS_CHOICES),
        choices=IMPORT_STATUS_CHOICES,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.source_id

    class Meta:
        unique_together = [("import_job", "source_id")]

    def run(self):
        from ..tasks import import_item_run

        import_item_run.delay(self.id)

    def _run(self):
        if self.source_type != "flickr":
            raise NotImplementedError(self.source_type)

        from ..importers.flickr_link import import_flickr_link

        import_flickr_link(
            self.import_job.parent_album.path,
            self.source_id,
            leaf_album_title=self.import_job.leaf_album_title,
        )
