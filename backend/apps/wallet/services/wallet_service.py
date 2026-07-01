import logging

from django.db import IntegrityError, transaction
from django.db.models import F
from rest_framework.exceptions import ValidationError

from apps.notifications.services.notification_service import NotificationService
from apps.wallet.models import Transaction, Wallet
from apps.wallet.services.stripe_service import StripePaymentService

logger = logging.getLogger(__name__)

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
        logger.info(
            "Deposit requested user_id=%s amount=%s idempotency_key_exists=%s",
            user.id,
            amount,
            bool(idempotency_key),
        )


        existing = None

        with transaction.atomic():
            if idempotency_key:
                existing = Transaction.objects.filter(
                    idempotency_key=idempotency_key
                ).first()

            if existing:
                logger.info(
                    "Deposit idempotency hit"
                    " user_id=%s transaction_id=%s status=%s amount=%s",
                    user.id,
                    existing.id,
                    existing.status,
                    existing.amount,
                )

                return {
                    'transaction_id': str(existing.id),
                    'status': existing.status,
                    'amount': str(existing.amount),
                    'checkout_url': None,
                }

            try:
                payment_transaction = Transaction.objects.create(
                    user=user,
                    amount=amount,
                    transaction_type='deposit',
                    status='pending',
                    idempotency_key=idempotency_key,
                )
            except IntegrityError:
                logger.warning(
                    "Deposit failed duplicate transaction request user_id=%s amount=%s",
                    user.id,
                    amount,
                )
                raise ValidationError({'detail': 'Duplicate transaction request'})

            logger.info(
                "Deposit transaction created user_id=%s transaction_id=%s amount=%s",
                user.id,
                payment_transaction.id,
                amount,
            )

            checkout_url = StripePaymentService.create_checkout_session(
                user=user, amount=amount, transaction_id=payment_transaction.id
            )

            logger.info(
                "Deposit checkout session created user_id=%s transaction_id=%s",
                user.id,
                payment_transaction.id,
            )

            return {
                'transaction_id': str(payment_transaction.id),
                'checkout_url': checkout_url,
            }

    @staticmethod
    def withdraw(user, amount, idempotency_key=None):
        logger.info(
            "Withdraw requested user_id=%s amount=%s idempotency_key_exists=%s",
            user.id,
            amount,
            bool(idempotency_key),
        )

        existing = None

        with transaction.atomic():
            if idempotency_key:
                existing = Transaction.objects.filter(
                    idempotency_key=idempotency_key
                ).first()

            if existing:
                logger.info(
                    "Withdraw idempotency hit"
                    " user_id=%s transaction_id=%s status=%s amount=%s",
                    user.id,
                    existing.id,
                    existing.status,
                    existing.amount,
                )

                return {
                    'transaction_id': str(existing.id),
                    'status': existing.status,
                    'amount': str(existing.amount),
                    'balance_after': None,
                }

            try:
                wallet = Wallet.objects.select_for_update().get(user=user)
            except Wallet.DoesNotExist:
                logger.warning(
                    "Withdraw failed wallet does not exist user_id=%s amount=%s",
                    user.id,
                    amount,
                )

                raise ValidationError({'detail': 'Wallet does not exist'})

            if wallet.balance < amount:
                logger.warning(
                    "Withdraw failed insufficient"
                    " balance user_id=%s balance=%s amount=%s",
                    user.id,
                    wallet.balance,
                    amount,
                )

                raise ValidationError({'detail': 'Insufficient balance'})

            try:
                withdraw_transaction = Transaction.objects.create(
                    user=user,
                    amount=amount,
                    transaction_type='withdraw',
                    status='pending',
                    idempotency_key=idempotency_key,
                )
            except IntegrityError:
                logger.warning(
                    "Withdraw failed duplicate"
                    " transaction request user_id=%s amount=%s",
                    user.id,
                    amount,
                )

                raise ValidationError({'detail': 'Duplicate transaction request'})


            logger.info(
                "Withdraw transaction created user_id=%s transaction_id=%s amount=%s",
                user.id,
                withdraw_transaction.id,
                amount,
            )

            wallet.balance = F('balance') - amount
            wallet.save()

            withdraw_transaction.status = 'completed'
            withdraw_transaction.save()

            wallet.refresh_from_db()
            withdraw_transaction.refresh_from_db()

            logger.info(
                "Withdraw completed"
                " user_id=%s transaction_id=%s amount=%s balance_after=%s",
                user.id,
                withdraw_transaction.id,
                withdraw_transaction.amount,
                wallet.balance,
            )

            NotificationService.create_notification(
                user=user,
                notification_type='withdraw',
                title='Withdraw successful',
                message=f'Your withdrawal of {amount} USD has'
                        f' been successfully processed.',
            )

            logger.info(
                "Withdraw notification created user_id=%s transaction_id=%s",
                user.id,
                withdraw_transaction.id,
            )

            return {
                'transaction_id': str(withdraw_transaction.id),
                'status': withdraw_transaction.status,
                'amount': str(withdraw_transaction.amount),
                'balance_after': str(wallet.balance),
            }
