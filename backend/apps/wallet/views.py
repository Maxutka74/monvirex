import stripe
from django.conf import settings
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.wallet.serializers import (
    CryptoTransactionHistorySerializer,
    CryptoWalletSerializer,
    DepositSerializer,
    TransactionHistorySerializer,
    WithdrawSerializer,
)
from apps.wallet.services.crypto_service import CryptoWalletService
from apps.wallet.services.stripe_service import StripePaymentService
from apps.wallet.services.wallet_service import WalletService
from config.throttles import DepositThrottle


# Create your views here.
class WalletBalanceView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        balance = WalletService.get_balance(user=request.user)
        response = Response(
            {'user': request.user.email, 'balance': str(balance)},
            status=status.HTTP_200_OK,
        )

        return response


class TransactionHistoryView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        transactions = WalletService.get_transaction_history(user=request.user)
        serializer = TransactionHistorySerializer(transactions, many=True)

        response = Response(
            {
                'transactions': serializer.data,
            }
        )

        return response


class WalletDepositView(APIView):
    permission_classes = (IsAuthenticated,)
    throttle_classes = [DepositThrottle]

    @extend_schema(request=DepositSerializer)
    def post(self, request):
        serializer = DepositSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        deposit_service = WalletService.deposit(
            user=request.user,
            amount=serializer.validated_data['amount'],
            idempotency_key=serializer.validated_data['idempotency_key'],
        )

        response = Response(
            {
                'transaction_id': deposit_service['transaction_id'],
                'checkout_url': deposit_service['checkout_url'],
            },
            status=status.HTTP_200_OK,
        )

        return response


class StripeWebhookView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        payload = request.body
        sign_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            event = stripe.Webhook.construct_event(
                payload, sign_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except Exception:
            return HttpResponse(status=400)

        if event['type'] == 'checkout.session.completed':
            StripePaymentService.handle_success(event['data']['object'])

        elif event['type'] in [
            'payment_intent.payment_failed',
            'payment_intent.requires_payment_method',
        ]:
            StripePaymentService.handle_failed(event['data']['object'])

        return HttpResponse(status=200)


class WalletWithdrawView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(request=WithdrawSerializer)
    def post(self, request):
        serializer = WithdrawSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        withdraw_service = WalletService.withdraw(
            user=request.user,
            amount=serializer.validated_data['amount'],
            idempotency_key=serializer.validated_data['idempotency_key'],
        )

        response = Response(
            {
                'transaction_id': withdraw_service['transaction_id'],
                'status': withdraw_service['status'],
                'amount': withdraw_service['amount'],
                'balance_after': withdraw_service['balance_after'],
            },
            status=status.HTTP_200_OK,
        )

        return response


class PortfolioView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        portfolio = CryptoWalletService.get_portfolio(user=request.user)
        serializer = CryptoWalletSerializer(portfolio, many=True)

        response = Response({'portfolio': serializer.data}, status=status.HTTP_200_OK)

        return response


class CryptoTransactionView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        crypto_transactions = CryptoWalletService.get_crypto_transaction_history(
            user=request.user
        )
        serializer = CryptoTransactionHistorySerializer(crypto_transactions, many=True)

        response = Response(
            {'transactions': serializer.data}, status=status.HTTP_200_OK
        )

        return response
