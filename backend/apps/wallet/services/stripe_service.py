import stripe
from django.db import transaction
from django.db.models import F

from django.conf import settings
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
        metadata = getattr(session, "metadata", None) or {}
        transaction_id = getattr(metadata, "transaction_id", None)
        stripe_session_id = session.id

        if not transaction_id:
            return

        with transaction.atomic():
            tx = Transaction.objects.select_for_update().filter(pk=transaction_id).first()

            if not tx or tx.status == 'completed':
                return

            if tx.stripe_session_id != stripe_session_id:
                return

            tx.status = 'completed'
            tx.save()

            wallet = Wallet.objects.select_for_update().get(user=tx.user)
            wallet.balance = F('balance') + tx.amount
            wallet.save()

    @staticmethod
    def handle_failed(session):
        metadata = getattr(session, "metadata", None) or {}
        transaction_id = getattr(metadata, "transaction_id", None)

        if not transaction_id:
            return

        Transaction.objects.filter(pk=transaction_id).update(
            status='failed',
        )