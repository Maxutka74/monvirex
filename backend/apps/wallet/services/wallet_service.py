from django.db import transaction, IntegrityError
from django.db.models import F
from rest_framework.exceptions import ValidationError

from apps.wallet.models import Transaction, Wallet
from apps.wallet.services.stripe_service import StripePaymentService
from apps.notifications.services.notification_service import NotificationService


class WalletService:

    @staticmethod
    def get_balance(user):
        wallet, _ = Wallet.objects.get_or_create(user=user)

        return wallet.balance

    @staticmethod
    def get_transaction_history(user):
        transactions = Transaction.objects.filter(user=user).order_by('-created_at')

        return transactions

    @staticmethod
    def deposit(user, amount, idempotency_key=None):

        existing = None

        with transaction.atomic():

            if idempotency_key:
                existing = Transaction.objects.filter(idempotency_key=idempotency_key).first()

            if existing:
                
                return {
                    "transaction_id": str(existing.id),
                    "status": existing.status,
                    "amount": str(existing.amount),
                    "checkout_url": None
                }

            try:
                payment_transaction = Transaction.objects.create(
                user=user,
                amount=amount,
                transaction_type='deposit',
                status='pending',
                idempotency_key=idempotency_key
                )
            except IntegrityError:
                raise ValidationError({"detail": "Duplicate transaction request"})

            checkout_url = StripePaymentService.create_checkout_session(user=user, amount=amount, transaction_id=payment_transaction.id)

            return {
                "transaction_id": str(payment_transaction.id),
                "checkout_url": checkout_url
            }


    @staticmethod
    def withdraw(user, amount, idempotency_key=None):

        existing = None

        with transaction.atomic():

            if idempotency_key:
                existing = Transaction.objects.filter(idempotency_key=idempotency_key).first()

            if existing:

                return {
                    "transaction_id": str(existing.id),
                    "status": existing.status,
                    "amount": str(existing.amount),
                    "balance_after": None
                }

            try:
                wallet = Wallet.objects.select_for_update().get(user=user)
            except Wallet.DoesNotExist:
                raise ValidationError({"detail": "Wallet does not exist"})

            if wallet.balance < amount:
                raise ValidationError({"detail": "Insufficient balance"})

            try:
                withdraw_transaction = Transaction.objects.create(
                    user=user,
                    amount=amount,
                    transaction_type='withdraw',
                    status='pending',
                    idempotency_key=idempotency_key
                )
            except IntegrityError:
                raise ValidationError({"detail": "Duplicate transaction request"})


            wallet.balance = F('balance') - amount
            wallet.save()

            withdraw_transaction.status = 'completed'
            withdraw_transaction.save()

            wallet.refresh_from_db()
            withdraw_transaction.refresh_from_db()

            NotificationService.create_notification(user=user, notification_type='withdraw', title='Withdraw successful',
                                        message=f'Your withdrawal of {amount} USD has been successfully processed.')

            return {
                "transaction_id": str(withdraw_transaction.id),
                "status": withdraw_transaction.status,
                "amount": str(withdraw_transaction.amount),
                "balance_after": str(wallet.balance)
            }
