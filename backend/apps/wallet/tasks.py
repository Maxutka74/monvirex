import logging
from datetime import timedelta

from celery import shared_task
from django.utils.timezone import now

from apps.wallet.models import Transaction

logger = logging.getLogger(__name__)

@shared_task
def expired_pending_transactions():
    logger.info("Celery task expired_pending_transactions started")

    expired_before = now() - timedelta(hours=24)

    updated_count = Transaction.objects.filter(
        status='pending', created_at__lt=expired_before
    ).update(status='cancelled')

    logger.info(
        "Expired pending transactions cancelled count=%s expired_before=%s",
        updated_count,
        expired_before,
    )
