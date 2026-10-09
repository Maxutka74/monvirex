import dj_database_url

from .base import *

DEBUG = False

DATABASES = {'default': dj_database_url.parse(config('DATABASE_URL'))}

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': config('REDIS_URL'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
    }
}

CELERY_BROKER_USE_SSL = {
    'ssl_cert_reqs': 'required',
}

CELERY_REDIS_BACKEND_USE_SSL = {
    'ssl_cert_reqs': 'required',
}

CELERY_BROKER_URL = config('REDIS_URL')
CELERY_RESULT_BACKEND = config('REDIS_URL')

CORS_ALLOWED_ORIGINS = [
    config('CORS_ALLOWED_ORIGINS')
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    config('CORS_ALLOWED_ORIGINS')
]