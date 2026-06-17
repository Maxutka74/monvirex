from rest_framework import status, filters
from rest_framework.exceptions import NotFound
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.assets.serializers import AssetListSerializer, AssetDetailSerializer, AssetKlineSerializer
from apps.assets.service.binance.service import AssetService
from apps.assets.selectors import AssetSelector
from apps.assets.service.binance.validators import validate_symbol, validate_interval
from apps.assets.pagination import AssetsPagination


# Create your views here.
class AssetListView(ListAPIView):
    permission_classes = (AllowAny,)
    serializer_class = AssetListSerializer
    pagination_class = AssetsPagination
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ['symbol', 'name']
    ordering_fields = ['current_price', 'price_change_24h', 'volume_24h', 'symbol', 'name']

    def get_queryset(self):
        return AssetSelector.get_assets()

class AssetDetailView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, symbol):
        symbol = validate_symbol(symbol)

        asset = AssetSelector.get_asset(symbol=symbol)

        if not asset:
            raise NotFound({"detail": "Not found"})

        serializer = AssetDetailSerializer(asset)

        response = Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

        return response

class AssetKlinesView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, symbol, interval, limit):
        client = AssetService()

        symbol = validate_symbol(symbol)
        interval = validate_interval(interval)

        klines = client.get_klines_asset(symbol=symbol, interval=interval, limit=limit)

        serializer = AssetKlineSerializer(klines, many=True)

        response = Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

        return response