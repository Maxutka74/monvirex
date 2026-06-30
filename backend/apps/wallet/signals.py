from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.auth_app.models import User
from apps.wallet.models import Wallet


@receiver(post_save, sender=User)
def create_user_wallet(sender, instance, created, **kwargs):
    if created:
        Wallet.objects.create(user=instance)
