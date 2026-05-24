import hashlib
import hmac
import logging
import time

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.auth_app.models import User

logger = logging.getLogger(__name__)

class GoogleAuthService:

    @staticmethod
    def google_auth(data):
        token = data['token']

        try:
            id_info = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
        except Exception as e:
            logger.error(f"Google Auth Error: {e}")
            raise ValidationError({'detail': 'Invalid credentials'})

        email = id_info.get('email')
        first_name = id_info.get('given_name', '')
        last_name = id_info.get('family_name', '')

        user = User.objects.filter(email=email).first()

        if not user:
            user = User.objects.create(email=email, first_name=first_name, last_name=last_name)
            user.set_unusable_password()
            user.save()

        refresh = RefreshToken.for_user(user)

        return user, refresh


class TelegramAuthService:

    @staticmethod
    def telegram_auth(data):
        telegram_id = data['id']
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        auth_date = data['auth_date']
        hash_value = data.get('hash')

        clean_data = {k: v for k,v in data.items() if k != 'hash' and v is not None}

        sort_data = sorted(clean_data.items())

        check_hash = '\n'.join((f'{k}={v}' for k,v in sort_data))

        secret = hashlib.sha256(settings.TELEGRAM_BOT_TOKEN.encode()).digest()

        signature = hmac.new(secret, check_hash.encode(), digestmod=hashlib.sha256).hexdigest()

        if not hmac.compare_digest(hash_value, signature):
            raise ValidationError({'detail': 'Invalid credentials'})

        current_ts = time.time()
        if current_ts - auth_date > 86400:
            raise ValidationError({'detail': 'Invalid credentials'})

        first_name = first_name.strip() or 'Telegram User'

        user = User.objects.filter(telegram_id=telegram_id).first()

        if not user:
            user = User.objects.create(telegram_id=telegram_id, first_name=first_name, last_name=last_name)
            user.set_unusable_password()
            user.save()

        refresh = RefreshToken.for_user(user)

        return user, refresh
