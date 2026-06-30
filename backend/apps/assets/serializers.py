from rest_framework import serializers

from apps.assets.models import Asset


class AssetListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = [
            'symbol',
            'name',
            'icon_url',
            'current_price',
            'price_change_24h',
            'volume_24h',
        ]


class AssetDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = [
            'symbol',
            'name',
            'icon_url',
            'current_price',
            'price_change_24h',
            'volume_24h',
            'is_active',
            'created_at',
            'updated_at',
        ]


class AssetKlineSerializer(serializers.Serializer):
    time = serializers.IntegerField(required=True)
    open = serializers.CharField(required=True, max_length=50)
    high = serializers.CharField(required=True, max_length=50)
    low = serializers.CharField(required=True, max_length=50)
    close = serializers.CharField(required=True, max_length=50)
    volume = serializers.CharField(required=True, max_length=50)


class AssetPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['symbol', 'icon_url', 'current_price', 'price_change_24h']
