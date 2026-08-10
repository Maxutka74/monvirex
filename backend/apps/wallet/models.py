import uuid

from django.core.validators import MinValueValidator
from django.db import models

from apps.assets.models import Asset
from apps.auth_app.models import User


# Create your models here.
class Wallet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user.email or self.user.telegram_id} - {self.balance}'


class Transaction(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['transaction_type']),
            models.Index(fields=['stripe_session_id']),
        ]

    TRANSACTION_TYPE_CHOICES = [
        ('deposit', 'Deposit'),
        ('withdraw', 'Withdraw'),
    ]

    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='transactions'
    )
    idempotency_key = models.CharField(unique=True, null=True, blank=True)
    transaction_type = models.CharField(
        max_length=20, choices=TRANSACTION_TYPE_CHOICES, default='deposit'
    )
    amount = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)]
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    stripe_session_id = models.CharField(
        max_length=255, null=True, blank=True, unique=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (f'{self.user.email or self.user.telegram_id} - '
                f'{self.transaction_type} - {self.amount} - {self.status}')


class CryptoWallet(models.Model):
    class Meta:
        unique_together = ('user', 'asset')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='cryptowallet'
    )
    asset = models.ForeignKey(
        Asset, on_delete=models.CASCADE, related_name='cryptoasset'
    )
    amount = models.DecimalField(max_digits=20, decimal_places=10, default=0)
    average_buy_price = models.DecimalField(max_digits=20, decimal_places=10, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def current_value(self):
        return self.amount * self.asset.current_price

    @property
    def profit_loss(self):
        return (self.asset.current_price - self.average_buy_price) * self.amount

    def __str__(self):
        return (
            f'{self.user.email or self.user.telegram_id} - {self.asset} - {self.amount}'
        )


class CryptoTransaction(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['transaction_type']),
        ]

    TRANSACTION_TYPE_CHOICES = [
        ('buy', 'Buy'),
        ('sell', 'Sell'),
        ('exchange', 'Exchange'),
    ]

    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('pending', 'Pending'),
        ('cancelled', 'Cancelled'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transaction')
    from_asset = models.CharField(max_length=20, null=True, blank=True)
    asset = models.CharField(max_length=20)
    usdt_amount = models.DecimalField(max_digits=20, decimal_places=10, default=0)
    crypto_amount = models.DecimalField(max_digits=20, decimal_places=10, default=0)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (f'{self.user.email or self.user.telegram_id} - {self.asset} - '
                f'{self.transaction_type} - {self.usdt_amount} - '
                f'{self.crypto_amount} - {self.status}')

class PortfolioSnapshot(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['user', 'created_at'])
        ]

        ordering = ['created_at']

    user = models.ForeignKey(User, on_delete=models.CASCADE,
                             related_name='portfolio_snapshots')
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    crypto_value = models.DecimalField(max_digits=20, decimal_places=10, default=0)
    total_value = models.DecimalField(max_digits=20, decimal_places=10, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (f'{self.user.email or self.user.telegram_id} - '
                f'{self.total_value} - {self.created_at}')