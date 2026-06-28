from io import BytesIO

from PIL import Image, ImageOps
from django.core.files.base import ContentFile
from rest_framework.exceptions import ValidationError

from apps.auth_app.models import User


class ProfileService:

    @staticmethod
    def get_profile(user):
        return User.objects.get(id=user.id)

    @staticmethod
    def patch_profile(user, first_name, last_name):
        profile = ProfileService.get_profile(user)

        first_name = first_name.strip()
        last_name = last_name.strip()

        profile.first_name = first_name
        profile.last_name = last_name
        profile.save()

        return first_name, last_name

    @staticmethod
    def patch_profile_avatar(user, avatar):
        profile = ProfileService.get_profile(user)

        image = Image.open(avatar)
        image = image.convert('RGB')
        image = ImageOps.fit(image, (64, 64))

        buffer =BytesIO()
        image.save(buffer, format='WEBP', quality=90, optimize=True)

        file_name = f"avatar_{profile.id}.webp"
        image_file = ContentFile(buffer.getvalue(), name=file_name)

        profile.avatar.save(file_name, image_file, save=True)

        return profile.avatar_url

    @staticmethod
    def delete_profile_avatar(user):
        profile = ProfileService.get_profile(user)

        if profile.avatar:
            profile.avatar.delete(save=False)
            profile.save()


    @staticmethod
    def post_change_password(user, old_password, new_password):
        profile = ProfileService.get_profile(user)
        user_password = profile.check_password(old_password)

        if not user_password:
            raise ValidationError({'detail': 'Invalid credentials'})

        profile.set_password(new_password)
        profile.save()


    @staticmethod
    def delete_profile(user, password):
        profile = ProfileService.get_profile(user)
        user_password = profile.check_password(password)

        if not user_password:
            raise ValidationError({'detail': 'Invalid credentials'})

        profile.delete()