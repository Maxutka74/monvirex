from apps.ai.services.gemini_service import GeminiService
from apps.assets.models import Asset


class MarketAnalysisService:

    @staticmethod
    def market_analysis():
        market_context = []

        assets = Asset.objects.all().order_by('-current_price')[:50]

        for asset in assets:
            market_context.append(
                {
                    'symbol': asset.symbol,
                    'name': asset.name,
                    'current_price': float(asset.current_price),
                    'price_change_24h': float(asset.price_change_24h),
                    'volume_24h': float(asset.volume_24h),
                }
            )

        market_analyze = GeminiService()

        result_analysis = market_analyze.market_analysis(market_context)

        return result_analysis

