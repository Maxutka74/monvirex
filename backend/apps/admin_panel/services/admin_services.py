import datetime
import logging

from django.db.models import Sum
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
    def get_users(search=None, is_active=None):
        logger.info(
            "Admin requested users list search=%s is_active=%s",
            search,
            is_active,
        )
        users = User.objects.all().order_by('-date_joined')

        if search:
            users = users.filter(email__icontains=search)

        if is_active:
            users = users.filter(is_active=is_active)

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
    def transaction_user_all():
        logger.info("Admin requested all fiat transactions")

        all_users_transactions = []
        transactions = (
            Transaction.objects.select_related('user').all().order_by('-created_at')
        )

        for transaction in transactions:
            all_users_transactions.append(
                {
                    'id': transaction.id,
                    'user_email': transaction.user.email,
                    'transaction_type': transaction.transaction_type,
                    'amount': transaction.amount,
                    'status': transaction.status,
                    'created_at': transaction.created_at,
                }
            )

        return all_users_transactions

    @staticmethod
    def crypto_transaction_user_all():
        logger.info("Admin requested all crypto transactions")

        all_users_crypto_transactions = []

        crypto_transactions = (
            CryptoTransaction.objects.select_related('user')
            .all()
            .order_by('-created_at')
        )

        for crypto_transaction in crypto_transactions:
            all_users_crypto_transactions.append(
                {
                    'id': crypto_transaction.id,
                    'user_email': crypto_transaction.user.email,
                    'asset': crypto_transaction.asset,
                    'transaction_type': crypto_transaction.transaction_type,
                    'crypto_amount': crypto_transaction.crypto_amount,
                    'usdt_amount': crypto_transaction.usdt_amount,
                    'status': crypto_transaction.status,
                    'created_at': crypto_transaction.created_at,
                }
            )

        return all_users_crypto_transactions

    @staticmethod
    def toggle_asset_active(symbol):
        symbol = symbol.strip().upper()

        logger.info("Admin requested asset active toggle symbol=%s", symbol)

        asset = Asset.objects.filter(symbol=symbol).first()

        if not asset:
            logger.warning("Admin tried to toggle non-existing asset symbol=%s", symbol)
            raise ValidationError('Asset does not exist')

        old_status = asset.is_active
        asset.is_active = not asset.is_active
        asset.save()

        logger.warning(
            "Admin changed asset active status symbol=%s old_status=%s new_status=%s",
            asset.symbol,
            old_status,
            asset.is_active,
        )

        return {'symbol': asset.symbol, 'is_active': asset.is_active}

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
