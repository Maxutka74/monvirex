import logging
from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.wallet.models import CryptoTransaction, Transaction

logger = logging.getLogger(__name__)

class ActivitySummaryService:

    @staticmethod
    def get_summary(user, period):
        period = period.strip().lower()

        period_days = {
            '1d': 1,
            '7d': 7,
            '30d': 30,
        }

        if period not in period_days:
            logger.warning(
                'Invalid activity summary period for user %s: %s',
                user.id,
                period,
            )
            raise ValidationError({'detail': 'Period does not exist'})

        logger.info(
            'Getting activity summary for user %s with period %s',
            user.id,
            period,
        )

        days = period_days[period]
        start_date = timezone.now() - timedelta(days=days)

        logger.info(
            'Activity summary date range for user %s: period=%s, start_date=%s',
            user.id,
            period,
            start_date,
        )

        transactions = Transaction.objects.filter(user=user, status='completed',
                                                  created_at__gte=start_date)
        deposit_sum = (transactions.filter(transaction_type='deposit')
                       .aggregate(total=Sum('amount')))
        withdraw_sum = (transactions.filter(transaction_type='withdraw')
                        .aggregate(total=Sum('amount')))

        crypto_transactions = CryptoTransaction.objects.filter(user=user,
                                                               status='completed',
                                                               created_at__gte=start_date)
        buy_sum = (crypto_transactions.filter(transaction_type='buy')
                   .aggregate(total=Sum('usdt_amount')))
        sell_sum = (crypto_transactions.filter(transaction_type='sell')
                    .aggregate(total=Sum('usdt_amount')))
        exchange_sum = (crypto_transactions.filter(transaction_type='exchange')
                        .aggregate(total=Sum('usdt_amount')))

        logger.info(
            'Activity summary calculated for user %s: '
            'deposit=%s, withdraw=%s, buy=%s, sell=%s, exchange=%s',
            user.id,
            deposit_sum,
            withdraw_sum,
            buy_sum,
            sell_sum,
            exchange_sum,
        )

        return {
            'deposit': deposit_sum['total'] or 0,
            'withdraw': withdraw_sum['total'] or 0,
            'buy': buy_sum['total'] or 0,
            'sell': sell_sum['total'] or 0,
            'exchange': exchange_sum['total'] or 0,
        }