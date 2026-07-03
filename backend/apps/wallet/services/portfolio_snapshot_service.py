import logging
from datetime import timedelta

from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.wallet.models import CryptoWallet, PortfolioSnapshot, Wallet

logger = logging.getLogger(__name__)

class PortfolioSnapshotService:

    @staticmethod
    def calculate_crypto_value(user):
        logger.info('Calculating crypto value for user %s', user.id)

        crypto_value = 0
        crypto_wallets = CryptoWallet.objects.filter(user=user).select_related('asset')

        for crypto_wallet in crypto_wallets:
            crypto_value += crypto_wallet.amount * crypto_wallet.asset.current_price

        logger.info(
            'Crypto value calculated for user %s: %s',
            user.id,
            crypto_value,
        )

        return crypto_value

    @staticmethod
    def calculate_total_value(user):
        logger.info('Calculating total portfolio value for user %s', user.id)

        wallet = Wallet.objects.filter(user=user).first()
        crypto_value = PortfolioSnapshotService.calculate_crypto_value(user=user)

        if wallet:
            wallet_balance = wallet.balance
        else:
            logger.warning('Wallet not found for user %s', user.id)
            wallet_balance = 0

        total_value = wallet_balance + crypto_value

        logger.info(
            'Total portfolio value calculated for'
            ' user %s: wallet=%s, crypto=%s, total=%s',
            user.id,
            wallet_balance,
            crypto_value,
            total_value,
        )

        return {
            'wallet_balance': wallet_balance,
            'crypto_value': crypto_value,
            'total_value': total_value
        }

    @staticmethod
    def create_snapshot(user):
        logger.info('Creating portfolio snapshot for user %s', user.id)

        portfolio_values = PortfolioSnapshotService.calculate_total_value(user=user)

        portfolio_snapshot = PortfolioSnapshot.objects.create(user=user,
                                                              **portfolio_values)

        logger.info(
            'Portfolio snapshot created for user %s: snapshot_id=%s, total=%s',
            user.id,
            portfolio_snapshot.id,
            portfolio_snapshot.total_value,
        )

        return portfolio_snapshot

    @staticmethod
    def get_history(user, period):
        logger.info(
            'Getting portfolio history for user %s with period %s',
            user.id,
            period,
        )

        period = period.strip().lower()

        period_days = {
            '1d': 1,
            '7d': 7,
            '30d': 30,
        }

        if period not in period_days:
            logger.warning(
                'Invalid portfolio history period for user %s: %s',
                user.id,
                period,
            )

            raise ValidationError({'detail': 'Period must be one of: 1d, 7d, 30d'})

        days = period_days[period]

        start_date = timezone.now() - timedelta(days=days)

        snapshots = PortfolioSnapshot.objects.filter(user=user,
                                                     created_at__gte=start_date)

        logger.info(
            'Portfolio history fetched for user %s: period=%s, count=%s',
            user.id,
            period,
            snapshots.count(),
        )

        return snapshots