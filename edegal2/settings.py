from .settings_defaults import *


DEBUG = True

ALLOWED_HOSTS = []

SECRET_KEY = 'og-2x8#5dn66vgodpv)p#2vkrsteg7m53)mn&yo77(b)0+_g5s'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

LOGGING['loggers']['gallery']['level'] = 'DEBUG' if DEBUG else 'INFO'
