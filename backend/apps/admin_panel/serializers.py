from rest_framework import serializers

from apps.assets.models import Asset
from apps.auth_app.models import User
from apps.wallet.models import CryptoTransaction, Transaction


class AdminUserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'is_active', 'date_joined')


class AdminUserDetailSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    email = serializers.EmailField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)
    wallet_balance = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    crypto_holdings_count = serializers.IntegerField(read_only=True)
    total_trades_count = serializers.IntegerField(read_only=True)


class AdminUserToggleActiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'is_active')


class AdminUserTransactionAllSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Transaction
        fields = (
            'id',
            'user_email',
            'transaction_type',
            'amount',
            'status',
            'created_at',
        )


class AdminUserCryptoTransactionAllSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = CryptoTransaction
        fields = (
            'id',
            'user_email',
            'asset',
            'transaction_type',
            'crypto_amount',
            'usdt_amount',
            'status',
            'created_at',
        )


class AdminStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField(read_only=True)
    total_wallet_balance = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    total_transactions_24h = serializers.IntegerField(read_only=True)
    total_crypto_transaction_24h = serializers.IntegerField(read_only=True)
    total_crypto_value = serializers.DecimalField(
        max_digits=20, decimal_places=10, read_only=True)
    total_portfolio_value = serializers.DecimalField(
        max_digits=20, decimal_places=10, read_only=True
    )
    total_snapshots_count = serializers.IntegerField(read_only=True)
