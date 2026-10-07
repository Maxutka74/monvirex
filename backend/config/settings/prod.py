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

CELERY_BROKER_URL = config('REDIS_URL')
CELERY_RESULT_BACKEND = config('REDIS_URL')

CORS_ALLOWED_ORIGINS = [
    "https://monvirex-frontend.vercel.app",
]

CSRF_TRUSTED_ORIGINS = [
    "https://monvirex-frontend.vercel.app",
]