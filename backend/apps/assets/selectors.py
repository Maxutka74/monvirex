from apps.assets.models import Asset


class AssetSelector:
    @staticmethod
    def get_assets():
        return Asset.objects.filter(is_active=True)

    @staticmethod
    def get_asset(symbol: str):
        return Asset.objects.filter(symbol=symbol, is_active=True).first()
