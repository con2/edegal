import logging

from django.core.management import BaseCommand
from django.db import transaction

from ...models.picture import Picture
from ...utils import parse_ordering_number

logger = logging.getLogger(__name__)


class NotReally(RuntimeError):
    pass


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            "--really",
            default=False,
            action="store_true",
            help="Just print out warnings instead of actually changing things",
        )

        parser.add_argument(
            "-p",
            "--path",
            default="/",
            help="Subtree to process",
        )

    def handle(self, *args, **options):
        path = options["path"]
        if not path.endswith("/"):
            path += "/"

        with transaction.atomic():
            for picture in Picture.objects.filter(path__startswith=path):
                if (order := parse_ordering_number(picture.title)) is not None:
                    print(f"{picture.title} -> {order}")
                    if picture.order != order:
                        picture.order = order
                        picture.save()
                else:
                    print(f"{picture.title} -> ???")
            print()

            if not options["really"]:
                raise NotReally("It was only a dream :')")
