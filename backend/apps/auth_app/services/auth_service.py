from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.auth_app.models import User


class AuthService:
    @staticmethod
    def register(data):
        data.pop('password_confirm')
        user = User.objects.create_user(**data)
        refresh = RefreshToken.for_user(user=user)

        return user, refresh

    @staticmethod
    def login(data):
        try:
            user = User.objects.get(email=data['email'])
        except User.DoesNotExist:
            raise ValidationError('Email or Password is incorrect')

        if not user.check_password(data['password']):
            raise ValidationError('Email or Password is incorrect')

        refresh = RefreshToken.for_user(user=user)

        return user, refresh