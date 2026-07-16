from decimal import Decimal

from rest_framework import serializers

from apps.wallet.models import CryptoTransaction, PortfolioSnapshot, Transaction


class TransactionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('id', 'transaction_type', 'amount', 'status', 'created_at')


class DepositSerializer(serializers.Serializer):
    idempotency_key = serializers.UUIDField(required=True)
    amount = serializers.DecimalField(
        required=True, max_digits=10, decimal_places=2, min_value=10
    )


class WithdrawSerializer(serializers.Serializer):
    idempotency_key = serializers.UUIDField(required=True)
    amount = serializers.DecimalField(
        required=True, max_digits=10, decimal_places=2, min_value=0.01
    )


class CryptoWalletSerializer(serializers.Serializer):
    asset = serializers.CharField(source='asset.symbol', max_length=20)
    amount = serializers.DecimalField(max_digits=20, decimal_places=10)
    average_buy_price = serializers.DecimalField(max_digits=20, decimal_places=10)
    current_value = serializers.SerializerMethodField()
    profit_loss = serializers.SerializerMethodField()

    def get_current_value(self, obj):
        return str(obj.current_value)

    def get_profit_loss(self, obj):
        return str(obj.profit_loss)


class CryptoTransactionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CryptoTransaction
        fields = (
            'id',
            'asset',
            'transaction_type',
            'crypto_amount',
            'usdt_amount',
            'status',
            'created_at',
        )

class PortfolioSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioSnapshot
        fields = ('created_at', 'wallet_balance', 'crypto_value', 'total_value')