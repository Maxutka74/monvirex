from apps.wallet.models import CryptoTransaction, CryptoWallet


class CryptoWalletService:
    @staticmethod
    def get_portfolio(user):
        crypto_wallet = CryptoWallet.objects.filter(user=user, amount__gt=0)

        return crypto_wallet

    @staticmethod
    def get_crypto_transaction_history(user):
        crypto_history = CryptoTransaction.objects.filter(user=user).order_by(
            '-created_at'
        )

        return crypto_history
