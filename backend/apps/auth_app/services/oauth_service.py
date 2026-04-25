import logging

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
            raise ValidationError('Invalid credentials')

        email = id_info.get('email')
        first_name = id_info.get('given_name', '')
        last_name = id_info.get('family_name', '')

        user = User.objects.filter(email=email).first()

        if not user:
            user = User.objects.create(email=email, first_name=first_name, last_name=last_name)
            user.set_unusable_password()
            user.save()

        refresh = RefreshToken.for_user(user)

        return user,refresh