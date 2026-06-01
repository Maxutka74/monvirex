import stripe
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.wallet.serializers import DepositSerializer, WithdrawSerializer, TransactionHistorySerializer

from apps.wallet.services.wallet_service import WalletService
from django.conf import settings
from apps.wallet.services.stripe_service import StripePaymentService


# Create your views here.
class WalletBalanceView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        balance = WalletService.get_balance(user=request.user)
        response = Response({
            'user': request.user.email,
            'balance': str(balance)
        }, status=status.HTTP_200_OK)

        return response

class TransactionHistoryView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        transactions = WalletService.get_transaction_history(user=request.user)
        serializer = TransactionHistorySerializer(transactions, many=True)

        response = Response({
            'transactions': serializer.data,
        })

        return response



class WalletDepositView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(request=DepositSerializer)
    def post(self, request):
        serializer = DepositSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        deposit_service = WalletService.deposit(user=request.user, amount=serializer.validated_data['amount'], idempotency_key=serializer.validated_data['idempotency_key'])

        response = Response({
            'transaction_id': deposit_service['transaction_id'],
            'checkout_url': deposit_service['checkout_url'],
        }, status=status.HTTP_200_OK)

        return response

class StripeWebhookView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        payload = request.body
        sign_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            event = stripe.Webhook.construct_event(
                payload,
                sign_header,
                settings.STRIPE_WEBHOOK_SECRET
            )
        except Exception:
            return HttpResponse(status=400)

        if event['type'] == 'checkout.session.completed':
            StripePaymentService.handle_success(event['data']['object'])

        elif event['type'] in [
            'payment_intent.payment_failed',
            'payment_intent.requires_payment_method'
        ]:
            StripePaymentService.handle_failed(event['data']['object'])

        return HttpResponse(status=200)

class WalletWithdrawView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(request=WithdrawSerializer)
    def post(self, request):
        serializer = WithdrawSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        withdraw_service = WalletService.withdraw(user=request.user, amount=serializer.validated_data['amount'], idempotency_key=serializer.validated_data['idempotency_key'])

        response = Response({
            "transaction_id": withdraw_service['transaction_id'],
            "status": withdraw_service['status'],
            "amount": withdraw_service['amount'],
            "balance_after": withdraw_service['balance_after']
        }, status=status.HTTP_200_OK)

        return response


