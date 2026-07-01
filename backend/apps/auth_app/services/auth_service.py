import logging
from time import time

from django.contrib.auth.hashers import make_password
from django.core.cache import cache
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.auth_app.models import User
from apps.auth_app.tasks import send_email
from apps.auth_app.utils.otp import generate_id, generate_otp

logger = logging.getLogger(__name__)


class AuthService:
    @staticmethod
    def register(data):
        email = data['email']

        logger.info("Register requested email=%s", email)

        existing = cache.get(f'email_lock:{email}')
        if existing:
            logger.info("Register email lock exists email=%s", email)
            return existing

        reg_id = generate_id()
        code = generate_otp()
        expires_at = (time() + 121) * 1000

        user_data = {
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'email': email,
            'password': make_password(data['password']),
        }

        response_data = {
            'reg_id': reg_id,
            'email': email,
            'expires_at': expires_at,
        }

        cache.set(
            f'reg:{reg_id}',
            {
                'email': email,
                'user_data': user_data,
                'code': code,
            },
            timeout=900,
        )
        cache.set(f'email_lock:{email}', response_data, timeout=120)

        send_email.apply_async(
            args=[
                email,
                'Monvirex - Email Verification Code',
                {'code': code},
                'auth_app/verification_email.html',
            ],
            countdown=5,
        )

        logger.info(
            "Registration verification email scheduled email=%s reg_id=%s",
            email,
            reg_id,
        )

        return response_data

    @staticmethod
    def resend_register_code(data):
        reg_id = data['reg_id']
        data_cache = cache.get(f'reg:{reg_id}')

        logger.info("Resend registration code requested reg_id=%s", reg_id)

        if not data_cache:
            logger.warning("Resend registration code failed expired reg_id=%s", reg_id)
            raise ValidationError({'detail': 'Code has expired'})

        email = data_cache['email']
        existing = cache.get(f'email_lock:{email}')
        if existing:
            return existing

        user_data = data_cache['user_data']

        code = generate_otp()
        expires_at = (time() + 121) * 1000

        response_data = {
            'reg_id': reg_id,
            'email': email,
            'expires_at': expires_at,
        }

        cache.set(
            f'reg:{reg_id}',
            {
                'email': email,
                'user_data': user_data,
                'code': code,
            },
            timeout=900,
        )
        cache.set(f'email_lock:{email}', response_data, timeout=120)

        send_email.apply_async(
            args=[
                email,
                'Monvirex - Email Verification Code',
                {'code': code},
                'auth_app/verification_email.html',
            ],
            countdown=5,
        )

        logger.info("Registration code resent email=%s reg_id=%s", email, reg_id)

        return response_data

    @staticmethod
    def confirm_register(data):
        data_cache = cache.get(f'reg:{data["reg_id"]}')

        if not data_cache:
            raise ValidationError({'detail': 'Code has expired'})

        user_data = data_cache['user_data']
        code_check = data_cache['code']
        code = data['code']

        if code != code_check:
            raise ValidationError({'detail': 'Code is not valid'})

        user = User.objects.create(**user_data)
        logger.info("User registered successfully"
                    " user_id=%s email=%s", user.id, user.email)

        refresh = RefreshToken.for_user(user=user)

        cache.delete(f'reg:{data["reg_id"]}')
        cache.delete(f'email_lock:{user.email}')

        return user, refresh

    @staticmethod
    def login(data):
        user = User.objects.filter(email=data['email']).first()

        if not user or not user.check_password(data['password']):
            logger.warning("Failed login attempt email=%s", data['email'])
            raise ValidationError({'detail': 'Invalid credentials'})

        refresh = RefreshToken.for_user(user=user)

        logger.info("User logged in successfully"
                    " user_id=%s email=%s", user.id, user.email)

        return user, refresh

    @staticmethod
    def reset_password(data):
        email = data['email']

        existing = cache.get(f'reset_lock:{email}')
        if existing:
            return existing

        reset_id = generate_id()
        code = generate_otp()
        expires_at = (time() + 121) * 1000

        response_data = {'reset_id': reset_id, 'email': email, 'expires_at': expires_at}

        try:
            User.objects.get(email=email)
            cache.set(
                f'reset:{reset_id}',
                {
                    'email': email,
                    'code': code,
                },
                timeout=900,
            )
            cache.set(f'reset_lock:{email}', response_data, timeout=120)

        except User.DoesNotExist:
            logger.warning("Password reset requested for non-existing email=%s", email)
            raise ValidationError({'detail': 'Invalid request'})

        send_email.apply_async(
            args=[
                email,
                'Monvirex - Скидання пароля',
                {'code': code},
                'auth_app/reset_password_email.html',
            ],
            countdown=5,
        )

        logger.info("Password reset email scheduled"
                    " email=%s reset_id=%s", email, reset_id)

        return response_data

    @staticmethod
    def resend_password_code(data):
        reset_id = data['reset_id']
        data_cache = cache.get(f'reset:{reset_id}')

        if not data_cache:
            raise ValidationError({'detail': 'Code has expired'})

        email = data_cache['email']
        existing = cache.get(f'reset_lock:{email}')
        if existing:
            return existing

        code = generate_otp()
        expires_at = (time() + 121) * 1000

        response_data = {'reset_id': reset_id, 'email': email, 'expires_at': expires_at}

        cache.set(f'reset:{reset_id}', {'email': email, 'code': code})
        cache.set(f'reset_lock:{email}', response_data, timeout=120)

        send_email.apply_async(
            args=[
                email,
                'Monvirex - Скидання пароля',
                {'code': code},
                'auth_app/reset_password_email.html',
            ],
            countdown=5,
        )

        return response_data

    @staticmethod
    def confirm_reset_password(data):
        logger.info("Reset password confirmation requested"
                    " reset_id=%s", data['reset_id'])

        data_cache = cache.get(f'reset:{data["reset_id"]}')

        if not data_cache:
            raise ValidationError({'detail': 'Code has expired'})

        code_check = data_cache['code']
        code = data['code']

        if code != code_check:
            logger.warning("Invalid reset password code reset_id=%s", data['reset_id'])
            raise ValidationError({'detail': 'Code is not valid'})

        reset_verify_id = generate_id()
        email = data_cache['email']

        cache.set(f'reset_verify:{reset_verify_id}', email, timeout=900)

        cache.delete(f'reset:{data["reset_id"]}')

        logger.info("Reset password confirmed email=%s", email)

        return reset_verify_id

    @staticmethod
    def change_password(data):
        email = cache.get(f'reset_verify:{data["reset_verify_id"]}')

        if not email:
            raise ValidationError({'detail': 'Code has expired'})

        password = data['password']

        user = User.objects.get(email=email)
        user.set_password(password)
        user.save()

        logger.info("Password changed successfully user_id=%s email=%s", user.id, email)

        cache.delete(f'reset_verify:{data["reset_verify_id"]}')
        cache.delete(f'reset_lock:{email}')

    @staticmethod
    def refresh_token(data):
        try:
            token = RefreshToken(data)
            user_id = token['user_id']
            User.objects.get(id=user_id)

            return token

        except TokenError:
            raise ValidationError({'detail': 'Invalid refresh token'})

        except User.DoesNotExist:
            raise ValidationError({'detail': 'User does not exist'})
