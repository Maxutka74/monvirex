import datetime

from django.db.models import Sum
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.wallet.models import Wallet, CryptoWallet, CryptoTransaction, Transaction
from apps.auth_app.models import User
from apps.assets.models import Asset
from apps.assets.tasks import sync_assets_task


class AdminPanelServices:

    @staticmethod
    def get_users(search=None, is_active=None):
        users = User.objects.all().order_by('-date_joined')

        if search:
            users = users.filter(email__icontains=search)

        if is_active:
            users = users.filter(is_active=is_active)

        return users

    @staticmethod
    def get_user_detail(user_id):
        user = User.objects.filter(id=user_id).first()

        if not user:
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
            'total_trades_count': total_trades
        }

    @staticmethod
    def toggle_user_active(user_id):
        user = User.objects.filter(id=user_id).first()

        if not user:
            raise ValidationError('User does not exist')

        user.is_active = not user.is_active
        user.save()

        return {
            'id': user.id,
            'email': user.email,
            'is_active': user.is_active,
        }

    @staticmethod
    def transaction_user_all():
        all_users_transactions = []
        transactions = Transaction.objects.select_related('user').all().order_by('-created_at')

        for transaction in transactions:
            all_users_transactions.append({
            'id': transaction.id,
            'user_email': transaction.user.email,
            'transaction_type': transaction.transaction_type,
            'amount': transaction.amount,
            'status': transaction.status,
            'created_at': transaction.created_at
        })

        return all_users_transactions

    @staticmethod
    def crypto_transaction_user_all():
        all_users_crypto_transactions = []

        crypto_transactions = CryptoTransaction.objects.select_related('user').all().order_by('-created_at')

        for crypto_transaction in crypto_transactions:
            all_users_crypto_transactions.append({
                'id': crypto_transaction.id,
                'user_email': crypto_transaction.user.email,
                'asset': crypto_transaction.asset,
                'transaction_type': crypto_transaction.transaction_type,
                'crypto_amount': crypto_transaction.crypto_amount,
                'usdt_amount': crypto_transaction.usdt_amount,
                'status': crypto_transaction.status,
                'created_at': crypto_transaction.created_at
            })

        return all_users_crypto_transactions

    @staticmethod
    def toggle_asset_active(symbol):
        symbol = symbol.strip().upper()

        asset = Asset.objects.get(symbol=symbol)

        if not asset:
            raise ValidationError('Asset does not exist')

        asset.is_active = not asset.is_active
        asset.save()

        return {
            'symbol': asset.symbol,
            'is_active': asset.is_active
        }

    @staticmethod
    def sync_asset():
        sync_assets_task.delay()

        return {
            'message': 'Successfully sync asset'
        }

    @staticmethod
    def get_platform_stats():
        created_at = timezone.now() - datetime.timedelta(hours=24)

        users_count = User.objects.all().count()
        wallet_balance = Wallet.objects.all().aggregate(Sum("balance"))
        transaction_count = Transaction.objects.filter(created_at__gte=created_at).count()
        crypto_transaction_count = CryptoTransaction.objects.filter(created_at__gte=created_at).count()

        return {
            'total_users': users_count,
            'total_wallet_balance': wallet_balance['balance__sum'],
            'total_transactions_24h': transaction_count,
            'total_crypto_transaction_24h': crypto_transaction_count
        }