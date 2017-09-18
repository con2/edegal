from email.utils import parseaddr

import environ

from .settings_defaults import *  # noqa


env = environ.Env(DEBUG=(bool, False),)  # set default values and casting

if os.path.isfile('.env'):
    env.read_env('.env')


DEBUG = env.bool('DEBUG', default=False)
CAVALRY_ENABLED = DEBUG

ALLOWED_HOSTS = env('ALLOWED_HOSTS', default='').split()

SECRET_KEY = env.str('SECRET_KEY', default=('' if not DEBUG else 'xxx'))

ADMINS = [parseaddr(addr) for addr in env('ADMINS', default='').split(',') if addr]
MANAGERS = ADMINS

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
        'edegal': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    })


# Sending email
if env('EMAIL_HOST', default=''):
    EMAIL_HOST = env('EMAIL_HOST')
else:
    EMAIL_BACKEND = 'django.core.mail.backends.dummy.EmailBackend'

DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='spam@example.com')

EDEGAL_FRONTEND_URL = env('EDEGAL_FRONTEND_URL', default='http://localhost:3000')


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


if env('KOMPASSI_OAUTH2_CLIENT_SECRET', default=''):
    INSTALLED_APPS = INSTALLED_APPS + ('kompassi_oauth2',)
    AUTHENTICATION_BACKENDS = (
        'kompassi_oauth2.backends.KompassiOAuth2AuthenticationBackend',
    ) + AUTHENTICATION_BACKENDS

    KOMPASSI_INSTALLATION_SLUG = env('KOMPASSI_INSTALLATION_SLUG', default='turska')
    KOMPASSI_HOST = env('KOMPASSI_HOST', default='https://kompassi.eu')
    KOMPASSI_OAUTH2_AUTHORIZATION_URL = f'{KOMPASSI_HOST}/oauth2/authorize'
    KOMPASSI_OAUTH2_TOKEN_URL = f'{KOMPASSI_HOST}/oauth2/token'
    KOMPASSI_OAUTH2_CLIENT_ID = env('KOMPASSI_OAUTH2_CLIENT_ID')
    KOMPASSI_OAUTH2_CLIENT_SECRET = env('KOMPASSI_OAUTH2_CLIENT_SECRET')
    KOMPASSI_OAUTH2_SCOPE = ['read']
    KOMPASSI_API_V2_USER_INFO_URL = f'{KOMPASSI_HOST}/api/v2/people/me'
    KOMPASSI_API_V2_EVENT_INFO_URL_TEMPLATE = '{kompassi_host}/api/v2/events/{event_slug}'
    KOMPASSI_ADMIN_GROUP = env('KOMPASSI_ADMIN_GROUP', default='admins')
    KOMPASSI_EDITOR_GROUP = env('KOMPASSI_EDITOR_GROUP', default='conikuvat-staff')

    LOGIN_URL = '/admin/oauth2/login'

    EDEGAL_USE_KOMPASSI_OAUTH2 = True
else:
    EDEGAL_USE_KOMPASSI_OAUTH2 = False
