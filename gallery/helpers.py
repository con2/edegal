def log_get_or_create(logger, obj, created):
    logger.info('{kind} {path} {what_done}'.format(
        kind=obj.__class__.__name__,
        path=obj.path,
        what_done='created' if created else 'already exists',
    ))
