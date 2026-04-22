from PIL import Image
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import FileExtensionValidator
from rest_framework import serializers

from apps.auth_app.models import User


class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(min_length=2, max_length=50, required=True)
    last_name = serializers.CharField(min_length=2, max_length=50, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(min_length=8, write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(min_length=8, write_only=True, required=True, style={'input_type': 'password'})
    avatar = serializers.ImageField(validators=[FileExtensionValidator(allowed_extensions=['png', 'jpg', 'jpeg', 'webp'])],
    required=False)

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

        if not email:
            raise serializers.ValidationError('Email cannot be empty')

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError('Email already exists')

        return email

    def validate_avatar(self, file):
        img = Image.open(file)
        max_size = 5 * 1024 * 1024

        if file.size > max_size:
            raise serializers.ValidationError('File size is too big')

        if img.width < 100 or img.height < 100:
            raise serializers.ValidationError('File format is too small')

        if img.width > 2048 or img.height > 2048:
            raise serializers.ValidationError('File format is too big')

        return file



    def validate(self, data):
        password = data.get('password')
        password_confirm = data.get('password_confirm')

        if not password:
            raise serializers.ValidationError('Password cannot be empty')

        if not password_confirm:
            raise serializers.ValidationError({'password_confirm': 'Password confirmation should not be empty'})

        if password != password_confirm:
            raise serializers.ValidationError('Passwords do not match')

        try:
            validate_password(password)
        except DjangoValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})

        return data




class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True, style={'input_type': 'password'})