import environ

from .settings_defaults import *  # noqa


env = environ.Env(DEBUG=(bool, False),)  # set default values and casting


DEBUG = env.bool('DEBUG', default=False)

ALLOWED_HOSTS = env('ALLOWED_HOSTS', default='').split()

SECRET_KEY = env.str('SECRET_KEY', default=('' if not DEBUG else 'xxx'))

DATABASES = {
    'default': env.db(default='sqlite:///edegal.sqlite3'),
}

CACHES = {
    'default': env.cache(default='locmemcache://'),
}

if DEBUG:
    LOGGING['loggers'].update({
        # 'django.db': {
        #     'handlers': ['console'],
        #     'level': 'DEBUG',
        # },
        'edegal': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    })
