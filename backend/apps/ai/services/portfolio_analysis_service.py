from apps.ai.services.gemini_service import GeminiService
from apps.wallet.models import CryptoWallet


class PortfolioAnalysisService:

    @staticmethod
    def portfolio_analysis(user):
        portfolio_context = []

        crypto_currency = CryptoWallet.objects.select_related('asset').filter(user=user)

        for crypto in crypto_currency:
            portfolio_context.append({
                'symbol': crypto.asset.symbol,
                'amount': float(crypto.amount),
                'average_buy_price': float(crypto.average_buy_price),
                'current_price': float(crypto.asset.current_price),
                'current_value': float(crypto.current_value),
                'profit': float(crypto.profit_loss)
            })

        portfolio_analyze = GeminiService()

        result_analysis = portfolio_analyze.portfolio_analysis(portfolio_context)

        return result_analysis