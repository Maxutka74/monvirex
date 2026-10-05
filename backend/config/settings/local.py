import dj_database_url
from decouple import config

from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'ff2c-185-35-10-226.ngrok-free.app']

DATABASES = {'default': dj_database_url.parse(config('DATABASE_URL'))}

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://9428-185-35-11-92.ngrok-free.app'
]

CORS_ALLOW_CREDENTIALS = True
