import uuid
from django.contrib.auth.hashers import make_password
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache

from apps.auth_app.tasks import send_verification_email
from apps.auth_app.utils.otp import generate_otp
from apps.auth_app.models import User


class AuthService:

    @staticmethod
    def register(data):
        reg_id = str(uuid.uuid4())
        email = data['email']
        code = generate_otp()
        user_data = {
            "first_name": data['first_name'],
            "last_name": data['last_name'],
            "email": email,
            "password": make_password(data['password']),
        }


        if cache.get(f'email_lock:{data["email"]}'):
            return None

        cache.set(f'reg:{reg_id}', {
            'email': email,
            'user_data': user_data,
            'code': code,
        }, timeout=900)
        cache.set(f'email_lock:{email}', True, timeout=120)

        send_verification_email.apply_async(args=[email, code], countdown=5)

        return {"reg_id": reg_id}

    @staticmethod
    def confirm_register(data):
        data_cache = cache.get(f'reg:{data["reg_id"]}')

        if not data_cache:
            raise ValidationError('Code has expired')

        user = data_cache['user_data']
        code_check = data_cache['code']
        code = data['code']

        if code != code_check:
            raise ValidationError('Code is not valid')

        user = User.objects.create(**user)
        refresh = RefreshToken.for_user(user=user)

        cache.delete(f"reg:{data['reg_id']}")
        cache.delete(f'email_lock:{user.email}')

        return user, refresh

    @staticmethod
    def login(data):
        user = User.objects.filter(email=data['email']).first()

        if not user or not user.check_password(data['password']):
            raise ValidationError('Email or Password is incorrect')

        refresh = RefreshToken.for_user(user=user)

        return user, refresh