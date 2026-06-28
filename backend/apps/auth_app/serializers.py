from cProfile import Profile

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.auth_app.models import User


class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(min_length=2, max_length=50, required=True)
    last_name = serializers.CharField(min_length=2, max_length=50, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(min_length=8, write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(min_length=8, write_only=True, required=True, style={'input_type': 'password'})

    def validate_first_name(self, first_name):
        first_name = first_name.strip()

        if not first_name:
            raise serializers.ValidationError('First name cannot be empty')

        return first_name

    def validate_last_name(self, last_name):
        last_name = last_name.strip()

        if not last_name:
            raise serializers.ValidationError('Last name cannot be empty')

        return last_name

    def validate_email(self, email):
        email = email.strip().lower()

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError('Email already exists')

        return email


    def validate(self, data):
        password = data.get('password')
        password_confirm = data.get('password_confirm')

        if password != password_confirm:
            raise serializers.ValidationError('Passwords do not match')

        try:
            validate_password(password)
        except DjangoValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})

        return data

class ResendRegisterSerializer(serializers.Serializer):
    reg_id = serializers.CharField(required=True, min_length=36, max_length=36)

class ConfirmRegisterSerializer(serializers.Serializer):
    reg_id = serializers.CharField(required=True, min_length=36, max_length=36)
    code = serializers.CharField(min_length=6, max_length=6, required=True)

    def validate_code(self, code):
        if not code.isdigit():
            raise serializers.ValidationError('Code must contain only digits')
        return code

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True, style={'input_type': 'password'})
    remember_me = serializers.BooleanField(required=False, default=False)

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class ResendPasswordSerializer(serializers.Serializer):
    reset_id = serializers.CharField(required=True, min_length=36, max_length=36)

class ConfirmResetPasswordSerializer(serializers.Serializer):
    reset_id = serializers.CharField(required=True, min_length=36, max_length=36)
    code = serializers.CharField(min_length=6, max_length=6, required=True)

    def validate_code(self, code):
        if not code.isdigit():
            raise serializers.ValidationError('Code must contain only digits')
        return code

class ChangePasswordSerializer(serializers.Serializer):
    reset_verify_id = serializers.CharField(required=True, min_length=36, max_length=36)
    password = serializers.CharField(min_length=8, write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(min_length=8, write_only=True, required=True, style={'input_type': 'confirm_password'})

    def validate(self, data):
        password = data.get('password')
        password_confirm = data.get('password_confirm')

        if password != password_confirm:
            raise serializers.ValidationError('Passwords do not match')

        try:
            validate_password(password)
        except DjangoValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})

        return data

class GoogleLoginSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)

class TelegramLoginSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=True)
    first_name = serializers.CharField(required=True, max_length=50, allow_blank=True)
    last_name = serializers.CharField(required=False, max_length=50, allow_blank=True)
    username = serializers.CharField(required=False, max_length=50, allow_blank=True)
    photo_url = serializers.URLField(required=False, allow_blank=True)
    auth_date = serializers.IntegerField(required=True)
    hash = serializers.CharField(required=True, max_length=200)

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'avatar')

class ProfileChangeUsernameSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=True, max_length=50, allow_blank=True)
    last_name = serializers.CharField(required=True, max_length=50, allow_blank=True)

    def validate(self, data):
        first_name = data.get('first_name')
        last_name = data.get('last_name')

        if len(first_name) < 1 or len(last_name) < 1:
            raise serializers.ValidationError({'detail':'First name and last name cannot be empty'})

        return data

class ProfileDeleteSerializer(serializers.Serializer):
    password = serializers.CharField(required=True, min_length=8, write_only=True)

class ProfileAvatarSerializer(serializers.Serializer):
    avatar = serializers.ImageField(required=True)

    def validate(self, data):
        avatar = data.get('avatar')

        ALLOWED_TYPES = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'image/webp',
        ]

        size_mb = avatar.size / 1024 / 1024

        if size_mb > 3:
            raise serializers.ValidationError({'detail':'Avatar must be less than 3 MB'})

        if avatar.content_type not in ALLOWED_TYPES:
            raise serializers.ValidationError({'detail':'Avatar type must be one of {}'.format(ALLOWED_TYPES)})

        return data

class ProfileChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, min_length=8, write_only=True)
    new_password = serializers.CharField(min_length=8, write_only=True, required=True, style={'input_type': 'password'})
    new_password_confirm = serializers.CharField(min_length=8, write_only=True, required=True,
                                             style={'input_type': 'confirm_password'})

    def validate(self, data):
        new_password = data.get('new_password')
        new_password_confirm = data.get('new_password_confirm')

        if new_password != new_password_confirm:
            raise serializers.ValidationError({'detail': 'Passwords do not match'})

        return data


