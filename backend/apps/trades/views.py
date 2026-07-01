from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.trades.serializers import BuySerializer, ExchangeSerializer, SellSerializer
from apps.trades.services.trade_service import TradeService
from config.throttles import TradeThrottle

# Create your views here.


class BuyView(APIView):
    permission_classes = (IsAuthenticated,)
    throttle_classes = [TradeThrottle]

    @extend_schema(request=BuySerializer)
    def post(self, request):
        serializer = BuySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        buy = TradeService.buy(
            request.user,
            serializer.validated_data['symbol'],
            serializer.validated_data['amount_usdt'],
        )

        response = Response(
            {
                'user': request.user.email or request.user.telegram_id,
                'buy': buy,
            },
            status=status.HTTP_200_OK,
        )

        return response


class SellView(APIView):
    permission_classes = (IsAuthenticated,)
    throttle_classes = [TradeThrottle]

    @extend_schema(request=SellSerializer)
    def post(self, request):
        serializer = SellSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sell = TradeService.sell(
            request.user,
            serializer.validated_data['symbol'],
            serializer.validated_data['amount_crypto'],
        )

        response = Response(
            {
                'user': request.user.email or request.user.telegram_id,
                'sell': sell,
            },
            status=status.HTTP_200_OK,
        )

        return response


class ExchangeView(APIView):
    permission_classes = (IsAuthenticated,)
    throttle_classes = [TradeThrottle]

    @extend_schema(request=ExchangeSerializer)
    def post(self, request):
        serializer = ExchangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        exchange = TradeService.exchange(
            request.user,
            serializer.validated_data['from_asset'],
            serializer.validated_data['to_asset'],
            serializer.validated_data['amount_crypto'],
        )

        response = Response(
            {
                'user': request.user.email or request.user.telegram_id,
                'exchange': exchange,
            },
            status=status.HTTP_200_OK,
        )

        return response
