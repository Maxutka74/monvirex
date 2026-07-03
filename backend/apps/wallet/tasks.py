import logging
from datetime import timedelta

from celery import shared_task
from django.utils.timezone import now

from apps.auth_app.models import User
from apps.wallet.models import Transaction
from apps.wallet.services.portfolio_snapshot_service import PortfolioSnapshotService

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

@shared_task
def create_portfolio_snapshots():
    active_users = User.objects.filter(is_active=True)

    created_count = 0
    failed_count = 0

    logger.info('Starting creating portfolio snapshots')

    for user in active_users:
        try:
            PortfolioSnapshotService.create_snapshot(user=user)
            created_count += 1
        except Exception:
            failed_count += 1
            logger.exception('Failed to create portfolio snapshot for user %s', user.id)

    logger.info('Finished creating portfolio'
                ' snapshots created_count=%s failed_count=%s',
                created_count,
                failed_count)

    return {
        'created_snapshots': created_count,
        'failed_snapshots': failed_count,
    }