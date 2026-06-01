from rest_framework import serializers

from apps.wallet.models import Transaction


class TransactionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('id', 'transaction_type', 'amount', 'status', 'created_at')

class DepositSerializer(serializers.Serializer):
    idempotency_key = serializers.UUIDField(required=True)
    amount = serializers.DecimalField(required=True, max_digits=10, decimal_places=2, min_value=0.01)

class WithdrawSerializer(serializers.Serializer):
    idempotency_key = serializers.UUIDField(required=True)
    amount = serializers.DecimalField(required=True, max_digits=10, decimal_places=2, min_value=0.01)