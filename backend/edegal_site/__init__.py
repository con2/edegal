try:
    from .celery import app as celery_app  # noqa
except ImportError:
    from warnings import warn

    warn("Failed to import Celery. Background tasks not available.", stacklevel=2)
