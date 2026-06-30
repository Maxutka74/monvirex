from rest_framework import serializers


class BuySerializer(serializers.Serializer):
    symbol = serializers.CharField(max_length=20, required=True)
    amount_usdt = serializers.DecimalField(
        max_digits=20, decimal_places=10, required=True
    )


class SellSerializer(serializers.Serializer):
    symbol = serializers.CharField(max_length=20, required=True)
    amount_crypto = serializers.DecimalField(
        max_digits=20, decimal_places=10, required=True
    )


class ExchangeSerializer(serializers.Serializer):
    from_asset = serializers.CharField(max_length=20, required=True)
    to_asset = serializers.CharField(max_length=20, required=True)
    amount_crypto = serializers.DecimalField(
        max_digits=20, decimal_places=10, required=True
    )
