import dj_database_url
from decouple import config

from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'fcea-91-214-138-18.ngrok-free.app']

DATABASES = {'default': dj_database_url.parse(config('DATABASE_URL'))}

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
]

CORS_ALLOW_CREDENTIALS = True
