import logging

from django.contrib.auth.hashers import make_password
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache

from apps.auth_app.tasks import send_email
from apps.auth_app.utils.otp import generate_otp, generate_id
from apps.auth_app.models import User

logger = logging.getLogger(__name__)

class AuthService:

    @staticmethod
    def register(data):
        email = data['email']
        if cache.get(f'email_lock:{email}'):
            return None

        reg_id = generate_id()
        code = generate_otp()
        user_data = {
            "first_name": data['first_name'],
            "last_name": data['last_name'],
            "email": email,
            "password": make_password(data['password']),
        }


        cache.set(f'reg:{reg_id}', {
            'email': email,
            'user_data': user_data,
            'code': code,
        }, timeout=900)
        cache.set(f'email_lock:{email}', True, timeout=120)

        send_email.apply_async(args=[email, 'Monvirex - Email Verification Code', {'code':code}, 'auth_app/verification_email.html'], countdown=5)

        return reg_id

    @staticmethod
    def confirm_register(data):
        data_cache = cache.get(f'reg:{data["reg_id"]}')

        if not data_cache:
            raise ValidationError('Code has expired')

        user_data = data_cache['user_data']
        code_check = data_cache['code']
        code = data['code']

        if code != code_check:
            raise ValidationError('Code is not valid')

        user = User.objects.create(**user_data)
        logger.info(f'User created: {user.email}')

        refresh = RefreshToken.for_user(user=user)

        cache.delete(f"reg:{data['reg_id']}")
        cache.delete(f'email_lock:{user.email}')

        return user, refresh

    @staticmethod
    def login(data):
        user = User.objects.filter(email=data['email']).first()

        if not user or not user.check_password(data['password']):
            logger.warning(f"Failed login attempt for: {data['email']}")
            raise ValidationError('Email or Password is incorrect')

        refresh = RefreshToken.for_user(user=user)

        return user, refresh

    @staticmethod
    def reset_password(data):
        email = data['email']
        if cache.get(f'reset_lock:{email}'):
            return None

        reset_id = generate_id()
        code = generate_otp()

        try:
            User.objects.get(email=email)
            cache.set(f'reset:{reset_id}', {
                'email': email,
                'code': code,
            }, timeout=900)
            cache.set(f'reset_lock:{email}', True, timeout=120)
        except User.DoesNotExist:
            logger.error(f"User not found: {email}")
            raise ValidationError('Invalid request')

        send_email.apply_async(args=[email, 'Monvirex - Скидання пароля', {'code': code}, 'auth_app/reset_password_email.html'], countdown=5)

        return reset_id

    @staticmethod
    def confirm_reset_password(data):

        cached_data = cache.get(f'reset:{data["reset_id"]}')

        if not cached_data:
            raise ValidationError('Code has expired')

        code_check = cached_data['code']
        code = data['code']

        if code != code_check:
            raise ValidationError('Code is not valid')

        reset_verify_id = generate_id()
        email = cached_data['email']


        cache.set(f'reset_verify:{reset_verify_id}', email, timeout=900)

        cache.delete(f'reset:{data["reset_id"]}')

        return reset_verify_id

    @staticmethod
    def change_password(data):
        email = cache.get(f'reset_verify:{data['reset_verify_id']}')

        if not email:
            raise ValidationError('Code has expired')

        password = data['password']

        user = User.objects.get(email=email)
        user.set_password(password)
        user.save()

        logger.info(f"Password changed for: {email}")

        cache.delete(f'reset_verify:{data['reset_verify_id']}')
        cache.delete(f'reset_lock:{email}')

