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