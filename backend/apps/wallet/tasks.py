from datetime import timedelta

from celery import shared_task
from django.utils.timezone import now

from apps.wallet.models import Transaction


@shared_task
def expired_pending_transactions():
    Transaction.objects.filter(
        status='pending',
        created_at__lt=now()-timedelta(hours=24)
    ).update(status='cancelled')