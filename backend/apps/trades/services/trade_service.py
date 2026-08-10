import logging

from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.assets.models import Asset
from apps.notifications.services.notification_service import NotificationService
from apps.wallet.models import CryptoTransaction, CryptoWallet, Wallet

logger = logging.getLogger(__name__)

class TradeService:
    @staticmethod
    def buy(user, symbol, amount_usdt):
        logger.info(
            "Buy crypto requested user_id=%s symbol=%s amount_usdt=%s",
            user.id,
            symbol,
            amount_usdt,
        )

        asset = Asset.objects.filter(symbol=symbol).first()
        if not asset:
            logger.warning(
                "Buy crypto failed asset not found user_id=%s symbol=%s",
                user.id,
                symbol,
            )

            raise ValidationError({'detail': 'Asset not found'})

        price_asset = asset.current_price
        amount_crypto = amount_usdt / price_asset

        with transaction.atomic():
            wallet = Wallet.objects.select_for_update().filter(user=user).first()
            if not wallet:
                logger.warning(
                    "Buy crypto failed wallet does not exist user_id=%s symbol=%s",
                    user.id,
                    symbol,
                )

                raise ValidationError({'detail': 'Wallet does not exist'})
            if wallet.balance < amount_usdt:
                logger.warning(
                    "Buy crypto failed insufficient balance"
                    " user_id=%s symbol=%s balance=%s amount_usdt=%s",
                    user.id,
                    symbol,
                    wallet.balance,
                    amount_usdt,
                )

                raise ValidationError({'detail': 'Insufficient balance'})

            crypto_wallet, created = CryptoWallet.objects.get_or_create(
                user=user, asset=asset
            )
            if created:
                average_buy_price = price_asset
            else:
                average_buy_price = (
                    (crypto_wallet.amount * crypto_wallet.average_buy_price)
                    + (amount_crypto * price_asset)
                ) / (crypto_wallet.amount + amount_crypto)

            wallet.balance -= amount_usdt
            crypto_wallet.amount += amount_crypto
            crypto_wallet.average_buy_price = average_buy_price
            wallet.save()
            crypto_wallet.save()
            transaction_crypto = CryptoTransaction.objects.create(
                user=user,
                asset=symbol,
                usdt_amount=amount_usdt,
                crypto_amount=amount_crypto,
                transaction_type='buy',
                status='completed',
            )

        logger.info(
            "Buy crypto completed user_id=%s transaction_id=%s "
            "symbol=%s crypto_amount=%s usdt_amount=%s balance_after=%s",
            user.id,
            transaction_crypto.id,
            symbol,
            amount_crypto,
            amount_usdt,
            wallet.balance,
        )

        NotificationService.create_notification(
            user=user,
            notification_type='buy',
            title='Crypto purchase completed',
            message=f'You bought {round(amount_crypto, 8)} {asset.symbol} for {round(amount_usdt, 2)} USD.',
        )

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
            'status': transaction_crypto.status,
        }

    @staticmethod
    def sell(user, symbol, amount_crypto):
        logger.info(
            "Sell crypto requested user_id=%s symbol=%s amount_crypto=%s",
            user.id,
            symbol,
            amount_crypto,
        )

        asset = Asset.objects.filter(symbol=symbol).first()
        if not asset:
            logger.warning(
                "Sell crypto failed asset not found user_id=%s symbol=%s",
                user.id,
                symbol,
            )

            raise ValidationError({'detail': 'Asset not found'})

        amount_usdt = amount_crypto * asset.current_price

        with transaction.atomic():
            wallet = Wallet.objects.select_for_update().filter(user=user).first()
            crypto_wallet = (
                CryptoWallet.objects.select_for_update()
                .filter(user=user, asset=asset)
                .first()
            )

            if not wallet:
                logger.warning(
                    "Sell crypto failed wallet does not"
                    " exist user_id=%s symbol=%s",
                    user.id,
                    symbol,
                )

                raise ValidationError({'detail': 'Wallet does not exist'})

            if not crypto_wallet:
                logger.warning(
                    "Sell crypto failed crypto wallet"
                    " does not exist user_id=%s symbol=%s",
                    user.id,
                    symbol,
                )

                raise ValidationError({'detail': 'Crypto-Wallet does not exist'})

            if crypto_wallet.amount < amount_crypto:
                logger.warning(
                    "Sell crypto failed insufficient crypto"
                    " balance user_id=%s symbol=%s wallet_amount=%s amount_crypto=%s",
                    user.id,
                    symbol,
                    crypto_wallet.amount,
                    amount_crypto,
                )

                raise ValidationError(
                    {'detail': 'Wallet balance is lower than amount crypto'}
                )

            remaining_amount = crypto_wallet.amount - amount_crypto

            wallet.balance += amount_usdt
            crypto_wallet.amount = remaining_amount
            wallet.save()
            crypto_wallet.save()

            if remaining_amount == 0:
                crypto_wallet.delete()

            transaction_crypto = CryptoTransaction.objects.create(
                user=user,
                asset=symbol,
                usdt_amount=amount_usdt,
                crypto_amount=amount_crypto,
                transaction_type='sell',
                status='completed',
            )

        logger.info(
            "Sell crypto completed"
            " user_id=%s transaction_id=%s symbol=%s crypto_amount=%s"
            " usdt_amount=%s balance_after=%s remaining_amount=%s",
            user.id,
            transaction_crypto.id,
            symbol,
            amount_crypto,
            amount_usdt,
            wallet.balance,
            remaining_amount,
        )

        NotificationService.create_notification(
            user=user,
            notification_type='sell',
            title='Crypto sale completed',
            message=f'You sold {round(amount_crypto, 8)} {asset.symbol}'
                    f' for {round(amount_usdt, 2)} USD.',
        )

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
            'status': transaction_crypto.status,
        }

    @staticmethod
    def exchange(user, from_asset, to_asset, amount_crypto):
        logger.info(
            "Exchange crypto requested "
            "user_id=%s from_asset=%s to_asset=%s amount_crypto=%s",
            user.id,
            from_asset,
            to_asset,
            amount_crypto,
        )

        if from_asset == to_asset:
            logger.warning(
                "Exchange crypto failed same assets user_id=%s asset=%s",
                user.id,
                from_asset,
            )

            raise ValidationError({'detail': 'Asset cannot be the same'})

        asset_from = Asset.objects.filter(symbol=from_asset).first()
        asset_to = Asset.objects.filter(symbol=to_asset).first()

        if not asset_from or not asset_to:
            logger.warning(
                "Exchange crypto failed asset not"
                " found user_id=%s from_asset=%s to_asset=%s",
                user.id,
                from_asset,
                to_asset,
            )

            raise ValidationError({'detail': 'Asset not found'})

        with transaction.atomic():
            crypto_wallet_from = (
                CryptoWallet.objects.select_for_update()
                .filter(user=user, asset=asset_from)
                .first()
            )

            if not crypto_wallet_from:
                logger.warning(
                    "Exchange crypto failed source crypto"
                    " wallet does not exist user_id=%s from_asset=%s",
                    user.id,
                    from_asset,
                )

                raise ValidationError({'detail': 'Crypto-Wallet does not exist'})

            if crypto_wallet_from.amount < amount_crypto:
                logger.warning(
                    "Exchange crypto failed insufficient crypto balance"
                    " user_id=%s from_asset=%s wallet_amount=%s amount_crypto=%s",
                    user.id,
                    from_asset,
                    crypto_wallet_from.amount,
                    amount_crypto,
                )

                raise ValidationError({'detail': 'Insufficient crypto balance'})

            crypto_wallet_to, created = (
                CryptoWallet.objects.select_for_update().get_or_create(
                    user=user, asset=asset_to
                )
            )

            amount_usdt = amount_crypto * asset_from.current_price
            amount_to = amount_usdt / asset_to.current_price

            if created:
                average_buy_price = asset_to.current_price
            else:
                average_buy_price = (
                    (crypto_wallet_to.amount * crypto_wallet_to.average_buy_price)
                    + (amount_to * asset_to.current_price)
                ) / (crypto_wallet_to.amount + amount_to)

            crypto_wallet_from.amount -= amount_crypto
            crypto_wallet_from.save()
            crypto_wallet_to.amount += amount_to
            crypto_wallet_to.average_buy_price = average_buy_price
            crypto_wallet_to.save()

            transaction_crypto = CryptoTransaction.objects.create(
                user=user,
                from_asset=from_asset,
                asset=to_asset,
                usdt_amount=amount_to * asset_to.current_price,
                crypto_amount=amount_crypto,
                transaction_type='exchange',
                status='completed',
            )

        logger.info(
            "Exchange crypto completed user_id=%s transaction_id=%s"
            " from_asset=%s to_asset=%s amount_from=%s amount_to=%s usdt_equivalent=%s",
            user.id,
            transaction_crypto.id,
            from_asset,
            to_asset,
            amount_crypto,
            amount_to,
            amount_usdt,
        )

        NotificationService.create_notification(
            user=user,
            notification_type='exchange',
            title='Crypto exchange completed',
            message=f'You exchanged {round(amount_crypto, 8)} {from_asset}'
                    f' to {round(amount_to, 8)} {to_asset}.',
        )

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
            'status': transaction_crypto.status,
        }
