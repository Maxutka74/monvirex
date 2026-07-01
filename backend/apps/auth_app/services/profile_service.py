import logging
from io import BytesIO

from django.core.files.base import ContentFile
from PIL import Image, ImageOps
from rest_framework.exceptions import ValidationError

from apps.auth_app.models import User

logger = logging.getLogger(__name__)

class ProfileService:
    @staticmethod
    def get_profile(user):
        return User.objects.get(id=user.id)

    @staticmethod
    def patch_profile(user, first_name, last_name):
        logger.info("Profile update requested user_id=%s", user.id)

        profile = ProfileService.get_profile(user)

        first_name = first_name.strip()
        last_name = last_name.strip()

        profile.first_name = first_name
        profile.last_name = last_name
        profile.save()

        logger.info("Profile updated successfully user_id=%s", profile.id)

        return first_name, last_name

    @staticmethod
    def patch_profile_avatar(user, avatar):
        logger.info("Profile avatar update requested user_id=%s", user.id)

        profile = ProfileService.get_profile(user)

        image = Image.open(avatar)
        image = image.convert('RGB')
        image = ImageOps.fit(image, (64, 64))

        buffer = BytesIO()
        image.save(buffer, format='WEBP', quality=90, optimize=True)

        file_name = f'avatar_{profile.id}.webp'
        image_file = ContentFile(buffer.getvalue(), name=file_name)

        profile.avatar.save(file_name, image_file, save=True)

        logger.info(
            "Profile avatar updated successfully user_id=%s file_name=%s",
            profile.id,
            file_name,
        )

        return profile.avatar_url

    @staticmethod
    def delete_profile_avatar(user):
        logger.info("Profile avatar delete requested user_id=%s", user.id)

        profile = ProfileService.get_profile(user)

        if profile.avatar:
            profile.avatar.delete(save=False)
            profile.save()

            logger.info("Profile avatar deleted successfully user_id=%s", profile.id)

    @staticmethod
    def post_change_password(user, old_password, new_password):
        logger.info("Profile password change requested user_id=%s", user.id)

        profile = ProfileService.get_profile(user)
        user_password = profile.check_password(old_password)

        if not user_password:
            logger.warning(
                "Profile password change failed invalid old password user_id=%s",
                profile.id,
            )
            raise ValidationError({'detail': 'Invalid credentials'})

        profile.set_password(new_password)
        profile.save()

        logger.info("Profile password changed successfully user_id=%s", profile.id)

    @staticmethod
    def delete_profile(user, password):
        logger.warning("Profile delete requested user_id=%s", user.id)

        profile = ProfileService.get_profile(user)
        user_password = profile.check_password(password)

        if not user_password:
            logger.warning(
                "Profile delete failed invalid password user_id=%s",
                profile.id,
            )

            raise ValidationError({'detail': 'Invalid credentials'})

        profile.delete()

        logger.warning("Profile deleted user_id=%s email=%s", profile.id, profile.email)
