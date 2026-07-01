import logging

import stripe
from django.conf import settings
from django.db import transaction
from django.db.models import F
from rest_framework.exceptions import ValidationError

from apps.notifications.services.notification_service import NotificationService
from apps.wallet.models import Transaction, Wallet

stripe.api_key = settings.STRIPE_SECRET_KEY

logger = logging.getLogger(__name__)

class StripePaymentService:
    @staticmethod
    def create_checkout_session(user, amount, transaction_id):
        logger.info(
            "Stripe checkout session creation"
            " requested user_id=%s amount=%s transaction_id=%s",
            user.id,
            amount,
            transaction_id,
        )

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            mode='payment',
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f'Deposit for user {user.id}',
                        },
                        'unit_amount': int(amount * 100),
                    },
                    'quantity': 1,
                }
            ],
            success_url=settings.STRIPE_SUCCESS_URL,
            cancel_url=settings.STRIPE_CANCEL_URL,
            payment_intent_data={
                'metadata': {
                    'transaction_id': str(transaction_id),
                }
            },
            metadata={'transaction_id': str(transaction_id)},
        )
        Transaction.objects.filter(pk=transaction_id).update(
            stripe_session_id=session.id
        )

        logger.info(
            "Stripe checkout session created transaction_id=%s stripe_session_id=%s",
            transaction_id,
            session.id,
        )

        return session.url

    @staticmethod
    def handle_success(session):
        logger.info("Stripe success handler started")

        response = session.to_dict()
        metadata = response.get('metadata') or {}
        transaction_id = metadata.get('transaction_id')
        stripe_session_id = response.get('id')

        if not transaction_id:
            logger.warning("Stripe failed missing transaction_id in metadata")

            raise ValidationError({'detail': 'Missing transaction_id in metadata'})

        with transaction.atomic():
            tx = (
                Transaction.objects.select_for_update()
                .filter(pk=transaction_id)
                .first()
            )

            if not tx:
                logger.warning(
                    "Stripe failed transaction not found"
                    " transaction_id=%s stripe_session_id=%s",
                    transaction_id,
                    stripe_session_id,
                )

                raise ValidationError({'detail': 'Transaction not found'})

            if tx.stripe_session_id != stripe_session_id:
                logger.warning(
                    "Stripe failed session mismatch"
                    " transaction_id=%s expected_session_id=%s received_session_id=%s",
                    transaction_id,
                    tx.stripe_session_id,
                    stripe_session_id,
                )

                raise ValidationError({'detail': 'Stripe session mismatch'})

            if tx.status == 'completed':
                logger.info(
                    "Stripe ignored already completed"
                    " transaction_id=%s stripe_session_id=%s",
                    transaction_id,
                    stripe_session_id,
                )

                return None

            tx.status = 'completed'
            tx.save()

            wallet = Wallet.objects.select_for_update().get(user=tx.user)
            wallet.balance = F('balance') + tx.amount
            wallet.save()

        logger.info(
            "Stripe deposit completed"
            " transaction_id=%s user_id=%s amount=%s stripe_session_id=%s",
            tx.id,
            tx.user.id,
            tx.amount,
            stripe_session_id,
        )

        transaction_deposit = Transaction.objects.get(id=transaction_id)

        NotificationService.create_notification(
            user=transaction_deposit.user,
            notification_type='deposit',
            title='Deposit successful',
            message=f'Your deposit of {transaction_deposit.amount} USD has been'
                    f' successfully added to your balance.',
        )

        logger.info(
            "Stripe deposit notification created transaction_id=%s user_id=%s",
            transaction_id,
            transaction_deposit.user.id,
        )

        return {
            'transaction_id': transaction_id,
            'stripe_session_id': stripe_session_id,
            'status': tx.status,
        }

    @staticmethod
    def handle_failed(session):
        logger.info("Stripe failed handler started")

        response = session.to_dict()
        metadata = response.get('metadata') or {}
        transaction_id = metadata.get('transaction_id')

        if not transaction_id:
            logger.warning("Stripe failed handler missing transaction_id in metadata")
            raise ValidationError({'detail': 'Missing transaction_id in metadata'})

        updated_count = Transaction.objects.filter(pk=transaction_id).update(
            status='failed',
        )

        logger.warning(
            "Stripe payment marked as failed transaction_id=%s updated_count=%s",
            transaction_id,
            updated_count,
        )

        return {'transaction_id': transaction_id, 'status': 'failed'}
