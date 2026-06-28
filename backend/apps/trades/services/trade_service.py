from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.wallet.models import Wallet, CryptoWallet, CryptoTransaction
from apps.assets.models import Asset
from apps.notifications.services.notification_service import NotificationService


class TradeService:
    @staticmethod
    def buy(user, symbol, amount_usdt):
        asset = Asset.objects.filter(symbol=symbol).first()
        if not asset:
            raise ValidationError({"detail": "Asset not found"})

        price_asset = asset.current_price
        amount_crypto = amount_usdt / price_asset

        with transaction.atomic():
            wallet = Wallet.objects.select_for_update().filter(user=user).first()
            if not wallet:
                raise ValidationError({"detail":"Wallet does not exist"})
            if wallet.balance < amount_usdt:
                raise ValidationError({"detail":"Insufficient balance"})

            crypto_wallet, created = CryptoWallet.objects.get_or_create(user=user, asset=asset)
            if created:
                average_buy_price = price_asset
            else:
                average_buy_price = ((crypto_wallet.amount * crypto_wallet.average_buy_price) + (amount_crypto * price_asset)) / (crypto_wallet.amount + amount_crypto)

            wallet.balance -= amount_usdt
            crypto_wallet.amount += amount_crypto
            crypto_wallet.average_buy_price = average_buy_price
            wallet.save()
            crypto_wallet.save()
            transaction_crypto = CryptoTransaction.objects.create(user=user, asset=symbol, usdt_amount = amount_usdt, crypto_amount = amount_crypto, transaction_type='buy', status='completed')

        NotificationService.create_notification(user=user, notification_type='buy', title='Crypto purchase completed',
                                    message=f'You bought {amount_crypto} {asset.symbol} for {amount_usdt} USD.')

        return {
            'transaction_id': transaction_crypto.id,
            'asset': asset.symbol,
            'crypto_amount': transaction_crypto.crypto_amount,
            'usdt_amount': transaction_crypto.usdt_amount,
            'price_at_trade': price_asset,
            'balance_after': wallet.balance,
            'holdings': {
                'amount': amount_crypto,
                'average_buy_price': average_buy_price,
            },
            'status': transaction_crypto.status
        }

    @staticmethod
    def sell(user, symbol, amount_crypto):
        asset = Asset.objects.filter(symbol=symbol).first()
        if not asset:
            raise ValidationError({"detail": "Asset not found"})

        amount_usdt = amount_crypto * asset.current_price

        with transaction.atomic():
            wallet = Wallet.objects.select_for_update().filter(user=user).first()
            crypto_wallet = CryptoWallet.objects.select_for_update().filter(user=user, asset=asset).first()

            if not wallet:
                raise ValidationError({"detail":"Wallet does not exist"})

            if not crypto_wallet:
                raise ValidationError({"detail":"Crypto-Wallet does not exist"})

            if crypto_wallet.amount < amount_crypto:
                raise ValidationError({"detail":"Wallet balance is lower than amount crypto"})

            remaining_amount = crypto_wallet.amount - amount_crypto

            wallet.balance += amount_usdt
            crypto_wallet.amount = remaining_amount
            wallet.save()
            crypto_wallet.save()

            if remaining_amount == 0:
                crypto_wallet.delete()

            transaction_crypto = CryptoTransaction.objects.create(user=user, asset=symbol, usdt_amount = amount_usdt, crypto_amount = amount_crypto, transaction_type='sell', status='completed')

        NotificationService.create_notification(user=user, notification_type='sell', title='Crypto sale completed',
                                    message = f'You sold {round(amount_crypto, 3)} {asset.symbol} for {round(amount_usdt, 1)} USD.')

        return {
            'transaction_id': transaction_crypto.id,
            'asset': asset.symbol,
            'crypto_amount': transaction_crypto.crypto_amount,
            'usdt_amount': transaction_crypto.usdt_amount,
            'price_at_trade': asset.current_price,
            'balance_after': wallet.balance,
            'holdings': {
                'amount': remaining_amount,
                'average_buy_price': crypto_wallet.average_buy_price,
            },
            'status': transaction_crypto.status
        }

    @staticmethod
    def exchange(user, from_asset, to_asset, amount_crypto):
        if from_asset == to_asset:
            raise ValidationError({"detail": "Asset cannot be the same"})

        asset_from = Asset.objects.filter(symbol=from_asset).first()
        asset_to = Asset.objects.filter(symbol=to_asset).first()

        if not asset_from or not asset_to:
            raise ValidationError({"detail": "Asset not found"})

        with transaction.atomic():
            crypto_wallet_from = CryptoWallet.objects.select_for_update().filter(user=user, asset=asset_from).first()

            if not crypto_wallet_from:
                raise ValidationError({"detail": "Crypto-Wallet does not exist"})
            if crypto_wallet_from.amount < amount_crypto:
                raise ValidationError({"detail": "Insufficient crypto balance"})

            crypto_wallet_to, created = CryptoWallet.objects.select_for_update().get_or_create(user=user, asset=asset_to)

            amount_usdt = amount_crypto * asset_from.current_price
            amount_to = amount_usdt / asset_to.current_price

            if created:
                average_buy_price = asset_to.current_price
            else:
                average_buy_price = ((crypto_wallet_to.amount * crypto_wallet_to.average_buy_price) + (amount_to * asset_to.current_price)) / (crypto_wallet_to.amount + amount_to)

            crypto_wallet_from.amount -= amount_crypto
            crypto_wallet_from.save()
            crypto_wallet_to.amount += amount_to
            crypto_wallet_to.average_buy_price = average_buy_price
            crypto_wallet_to.save()

            transaction_crypto = CryptoTransaction.objects.create(user=user, asset=to_asset, usdt_amount=amount_to*asset_to.current_price, crypto_amount = amount_crypto, transaction_type='exchange', status='completed')

        NotificationService.create_notification(user=user, notification_type='exchange', title='Crypto exchange completed',
                                    message=f'You exchanged {round(amount_crypto, 3)} {from_asset} to {round(amount_to, 3)} {to_asset}.')

        return {
            'transaction_id': transaction_crypto.id,
            'from_asset': from_asset,
            'to_asset': to_asset,
            'amount_from': amount_crypto,
            'amount_to': amount_to,
            'usdt_equivalent': amount_usdt,
            'from_holding': {
                'amount': crypto_wallet_from.amount,
                'average_buy_price': crypto_wallet_from.average_buy_price,
            },
            'to_holding': {
                'amount': crypto_wallet_to.amount,
                'average_buy_price': crypto_wallet_to.average_buy_price,
            },
            'status': transaction_crypto.status
        }



