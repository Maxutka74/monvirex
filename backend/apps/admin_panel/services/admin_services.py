import datetime
import logging

from django.db.models import Sum
from django.db.models import Q
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.assets.models import Asset
from apps.assets.tasks import sync_assets_task
from apps.auth_app.models import User
from apps.wallet.models import (
    CryptoTransaction,
    CryptoWallet,
    PortfolioSnapshot,
    Transaction,
    Wallet,
)

logger = logging.getLogger(__name__)

class AdminPanelServices:
    @staticmethod
    def get_users(search=None):
        logger.info(
            "Admin requested users list search=%s",
            search
        )
        users = User.objects.all().order_by('-date_joined')

        if search:
            if search.isdigit():
                users = users.filter(id=search)
            else:
                users = users.filter(email__icontains=search)

        return users

    @staticmethod
    def get_user_detail(user_id):
        logger.info("Admin requested user detail user_id=%s", user_id)
        user = User.objects.filter(id=user_id).first()

        if not user:
            logger.warning("Admin requested non-existing"
                           " user detail user_id=%s", user_id)
            raise ValidationError('User does not exist')

        wallet = Wallet.objects.filter(user=user).first()
        crypto_holdings = CryptoWallet.objects.filter(user=user).count()
        total_trades = CryptoTransaction.objects.filter(user=user).count()

        return {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_active': user.is_active,
            'date_joined': user.date_joined,
            'wallet_balance': wallet.balance,
            'crypto_holdings_count': crypto_holdings,
            'total_trades_count': total_trades,
        }

    @staticmethod
    def toggle_user_active(user_id):
        logger.info("Admin requested user active toggle user_id=%s", user_id)
        user = User.objects.filter(id=user_id).first()

        if not user:
            logger.warning("Admin tried to toggle non-existing"
                           " user user_id=%s", user_id)
            raise ValidationError('User does not exist')

        old_status = user.is_active
        user.is_active = not user.is_active
        user.save()

        logger.warning(
            "Admin changed user active status user_id=%s old_status=%s new_status=%s",
            user.id,
            old_status,
            user.is_active,
        )

        return {
            'id': user.id,
            'email': user.email,
            'is_active': user.is_active,
        }

    @staticmethod
    def transaction_user_all(search=None):
        logger.info("Admin requested all fiat transactions")

        transactions = (
            Transaction.objects.select_related('user')
            .all()
            .order_by('-created_at')
        )

        if search:
            transactions = transactions.filter(Q(id__icontains=search) | Q(user__email__icontains=search))

        return transactions

    @staticmethod
    def crypto_transaction_user_all(search=None):
        logger.info("Admin requested all crypto transactions")

        crypto_transactions = (
            CryptoTransaction.objects.select_related('user')
            .all()
            .order_by('-created_at')
        )

        if search:
            crypto_transactions = crypto_transactions.filter(Q(id__icontains=search) | Q(user__email__icontains=search))

        return crypto_transactions

    @staticmethod
    def sync_asset():
        logger.info("Admin started assets sync task")

        sync_assets_task.delay()

        return {'message': 'Successfully sync asset'}

    @staticmethod
    def get_platform_stats():
        logger.info("Admin requested platform stats")

        created_at = timezone.now() - datetime.timedelta(hours=24)

        users_count = User.objects.all().count()
        wallet_balance = Wallet.objects.all().aggregate(total=Sum('balance'))
        total_wallet_balance = wallet_balance['total'] or 0
        transaction_count = Transaction.objects.filter(
            created_at__gte=created_at
        ).count()
        crypto_transaction_count = CryptoTransaction.objects.filter(
            created_at__gte=created_at
        ).count()

        total_crypto_value = 0

        crypto_wallets = CryptoWallet.objects.all().select_related('asset')
        for crypto_wallet in crypto_wallets:
            total_crypto_value += (crypto_wallet.amount *
                                   crypto_wallet.asset.current_price)

        total_portfolio_value = total_wallet_balance + total_crypto_value

        total_snapshots_count = PortfolioSnapshot.objects.all().count()

        logger.info(
            'Admin portfolio stats calculated: crypto=%s, portfolio=%s, snapshots=%s',
            total_crypto_value,
            total_portfolio_value,
            total_snapshots_count,
        )

        return {
            'total_users': users_count,
            'total_wallet_balance': total_wallet_balance,
            'total_transactions_24h': transaction_count,
            'total_crypto_transaction_24h': crypto_transaction_count,
            'total_crypto_value': total_crypto_value,
            'total_portfolio_value': total_portfolio_value,
            'total_snapshots_count': total_snapshots_count
        }
