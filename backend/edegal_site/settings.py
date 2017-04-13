import environ

from .settings_defaults import *  # noqa


env = environ.Env(DEBUG=(bool, False),)  # set default values and casting

if os.path.isfile('.env'):
    env.read_env('.env')


DEBUG = env.bool('DEBUG', default=False)
CAVALRY_ENABLED = DEBUG

ALLOWED_HOSTS = env('ALLOWED_HOSTS', default='').split()

SECRET_KEY = env.str('SECRET_KEY', default=('' if not DEBUG else 'xxx'))

DATABASES = {
    'default': env.db(default='sqlite:///edegal.sqlite3'),
}

if env('EDEGAL_COPPERMINE_DATABASE_URL', default=''):
    DATABASES['coppermine'] = env.db('EDEGAL_COPPERMINE_DATABASE_URL')

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
        'django.db.backends': {
            'level': 'DEBUG',
            'handlers': ['console'],
        }
    })


# Sending email
if env('EMAIL_HOST', default=''):
    EMAIL_HOST = env('EMAIL_HOST')
else:
    EMAIL_BACKEND = 'django.core.mail.backends.dummy.EmailBackend'

DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='spam@example.com')


if env('BROKER_URL', default=''):
    CELERY_BROKER_URL = env('BROKER_URL')
    CELERY_ACCEPT_CONTENT = ['json']

    CELERY_SEND_TASK_ERROR_EMAILS = not DEBUG
    CELERY_SERVER_EMAIL = DEFAULT_FROM_EMAIL

    CELERY_TASK_SERIALIZER = 'json'
    CELERY_RESULT_SERIALIZER = 'json'

    EDEGAL_USE_CELERY = True
else:
    EDEGAL_USE_CELERY = False
