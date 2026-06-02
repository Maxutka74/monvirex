import stripe
from django.db import transaction
from django.db.models import F

from django.conf import settings
from rest_framework.exceptions import ValidationError

from apps.wallet.models import Transaction, Wallet

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripePaymentService:

    @staticmethod
    def create_checkout_session(user, amount, transaction_id):
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": f"Deposit for user {user.id}",
                        },
                        "unit_amount": int(amount * 100),
                    },
                    "quantity": 1,
                }
            ],
            success_url=settings.STRIPE_SUCCESS_URL,
            cancel_url=settings.STRIPE_CANCEL_URL,

            payment_intent_data={
                "metadata": {
                    "transaction_id": str(transaction_id),
                }
            },

            metadata={
                "transaction_id": str(transaction_id)
            }
        )
        Transaction.objects.filter(pk=transaction_id).update(
            stripe_session_id=session.id
        )
        return session.url

    @staticmethod
    def handle_success(session):
        response = session.to_dict()
        metadata = response.get("metadata") or {}
        transaction_id = metadata.get("transaction_id")
        stripe_session_id = response.get("id")

        if not transaction_id:
            raise ValidationError({"detail": "Missing transaction_id in metadata"})

        with transaction.atomic():
            tx = Transaction.objects.select_for_update().filter(pk=transaction_id).first()

            if not tx:
                raise ValidationError({"detail": "Transaction not found"})

            if tx.stripe_session_id != stripe_session_id:
                raise ValidationError({"detail":"Stripe session mismatch"})

            if tx.status == "completed":
                return

            tx.status = 'completed'
            tx.save()

            wallet = Wallet.objects.select_for_update().get(user=tx.user)
            wallet.balance = F('balance') + tx.amount
            wallet.save()

        return {
            "transaction_id": transaction_id,
            "stripe_session_id": stripe_session_id,
            "status": tx.status
        }

    @staticmethod
    def handle_failed(session):
        response = session.to_dict()
        metadata = response.get("metadata") or {}
        transaction_id = metadata.get("transaction_id")

        if not transaction_id:
            raise ValidationError({"detail": "Missing transaction_id in metadata"})

        Transaction.objects.filter(pk=transaction_id).update(
            status='failed',
        )

        return {
            "transaction_id": transaction_id,
            "status": "failed"
        }