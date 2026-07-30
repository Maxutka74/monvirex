from rest_framework import filters, status
from rest_framework.exceptions import NotFound
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.assets.pagination import AssetsPagination
from apps.assets.selectors import AssetSelector
from apps.assets.serializers import (
    AssetDetailSerializer,
    AssetKlineSerializer,
    AssetListSerializer,
)
from apps.assets.service.binance.service import AssetService
from apps.assets.service.binance.validators import validate_interval, validate_symbol


# Create your views here.
class AssetListView(ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = AssetListSerializer
    pagination_class = AssetsPagination
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ['^name']
    ordering_fields = [
        'current_price',
        'price_change_24h',
        'volume_24h',
        'name',
    ]

    def get_queryset(self):
        queryset = AssetSelector.get_assets()
        symbols = self.request.query_params.get('symbols', None)

        if symbols is None:
            return queryset

        symbols_list = symbols.split(',')

        clear_symbols = []

        for symbol in symbols_list:
            if len(symbol.strip()) > 0:
                clear_symbols.append(symbol.strip())

        if len(clear_symbols) == 0:
            return queryset.none()

        return queryset.filter(symbol__in=clear_symbols)

class AssetDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, symbol):
        symbol = validate_symbol(symbol)

        asset = AssetSelector.get_asset(symbol=symbol)

        if not asset:
            raise NotFound({'detail': 'Not found'})

        serializer = AssetDetailSerializer(asset)

        response = Response(serializer.data, status=status.HTTP_200_OK)

        return response


class AssetKlinesView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, symbol, interval, limit):
        client = AssetService()

        symbol = validate_symbol(symbol)
        interval = validate_interval(interval)

        klines = client.get_klines_asset(symbol=symbol, interval=interval, limit=limit)

        serializer = AssetKlineSerializer(klines, many=True)

        response = Response(serializer.data, status=status.HTTP_200_OK)

        return response

class TopMoversView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        limit = request.query_params.get('limit', 7)

        data = AssetSelector.get_top_movers(limit=limit)

        serializer = AssetListSerializer(data, many=True)

        response = Response({'top_movers': serializer.data}, status=status.HTTP_200_OK)

        return response