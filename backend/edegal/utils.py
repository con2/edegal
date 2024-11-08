# NOTE: Keep this module doctestable (do not import django)

import re
from pathlib import Path

SLUGIFY_CHAR_MAP = {
    "ä": "a",
    "å": "a",
    "ö": "o",
    "ü": "",
    " ": "-",
    "_": "-",
    ".": "-",
}
SLUGIFY_FORBANNAD_RE = re.compile(r"[^a-z0-9-]", re.UNICODE)
SLUGIFY_MULTIDASH_RE = re.compile(r"-+", re.UNICODE)

SEPARATIST_PUNKS = ":-–—/"


def slugify(ustr: str) -> str:
    ustr = ustr.lower()
    ustr = "".join(SLUGIFY_CHAR_MAP.get(c, c) for c in ustr)
    ustr = SLUGIFY_FORBANNAD_RE.sub("", ustr)
    ustr = SLUGIFY_MULTIDASH_RE.sub("-", ustr)
    return ustr


def pick_attrs(obj, *attr_names, **extra_attrs):
    return dict(
        ((attr_name, getattr(obj, attr_name)) for attr_name in attr_names),
        **extra_attrs,
    )


def log_get_or_create(logger, obj, created):
    logger.info(
        "{kind} {name} {what_done}".format(
            kind=obj.__class__.__name__,
            name=str(obj),
            what_done="created" if created else "already exists",
        )
    )


def strip_photographer_name_from_title(title: str, name: str) -> str:
    """
    Given an album title and photographer name, tries very hard to remove the name of the
    photographer from the album title, leaving behind no funny punctuation.

    >>> strip_photographer_name_from_title('Foo Bar - Cool Pics', 'Foo Bar')
    'Cool Pics'
    >>> strip_photographer_name_from_title('', 'quux')
    ''
    >>> strip_photographer_name_from_title('Not Much Left', 'Not Much Left')
    ''
    """
    title = title.replace(name, "").strip()
    prev_title = None

    while title != prev_title:
        prev_title = title
        for punk in SEPARATIST_PUNKS:
            title = title.strip(punk).strip()

    return title


def parse_ordering_number(filename: str) -> int | None:
    """
    >>> parse_ordering_number("DSC_0330.jpg")
    330
    >>> parse_ordering_number("DSC_0330")
    330
    >>> parse_ordering_number("dsc-0330")
    330
    >>> parse_ordering_number("Mars2175_Tomi-50.jpg")
    50
    """
    basename = Path(filename).stem
    match = re.match(r".*?(\d+)$", basename, re.IGNORECASE)
    if match:
        return int(match.group(1))
    return None
