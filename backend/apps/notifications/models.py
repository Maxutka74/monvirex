import uuid

from django.db import models

from apps.auth_app.models import User

# Create your models here.


class Notification(models.Model):
    class Meta:
        indexes = [models.Index(fields=['user', 'is_read'])]
        ordering = ['-created_at']

    NOTIFICATION_TYPES = [
        ('deposit', 'Deposit'),
        ('withdraw', 'Withdraw'),
        ('trade_buy', 'Trade Buy'),
        ('trade_sell', 'Trade Sell'),
        ('trade_exchange', 'Trade Exchange'),
        ('system', 'System'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='notifications'
    )
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=100)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
