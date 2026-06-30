import re

from apps.assets.models import Asset
from apps.assets.service.binance.client import BinanceClient
from apps.assets.service.utils.icon import icon_exists


class AssetService:
    def __init__(self):
        self.client = BinanceClient()

    def sync_assets(self):
        tickers = self.client.get_all_tickers()
        symbols = self.client.get_exchange_info()

        tickers_map = {ticker['symbol']: ticker for ticker in tickers}

        for symbol in symbols:
            ticker_data = tickers_map.get(symbol['symbol'])
            if not ticker_data:
                continue

            base = symbol['symbol'].replace('USDT', '')

            name = re.sub(r'^\d+', '', base)
            coin = name

            icon_url = f'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/{coin.lower()}.png'

            if not icon_exists(icon_url):
                icon_url = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/generic.png'

            Asset.objects.update_or_create(
                symbol=ticker_data['symbol'],
                defaults={
                    'name': name,
                    'icon_url': icon_url,
                    'current_price': ticker_data['current_price'],
                    'price_change_24h': ticker_data['price_change_24h'],
                    'volume_24h': ticker_data['volume_24h'],
                },
            )

    def update_prices(self):
        symbols = self.client.get_all_tickers()

        symbols_map = {symbol['symbol']: symbol for symbol in symbols}

        assets = Asset.objects.filter(symbol__in=symbols_map.keys())

        updated_assets = []

        for asset in assets:
            data = symbols_map.get(asset.symbol)
            if not data:
                continue

            asset.current_price = data['current_price']
            asset.price_change_24h = data['price_change_24h']
            asset.volume_24h = data['volume_24h']

            updated_assets.append(asset)

        Asset.objects.bulk_update(
            updated_assets, ['current_price', 'price_change_24h', 'volume_24h']
        )

    def get_klines_asset(self, symbol: str, interval: str, limit: int = 500):
        return self.client.get_klines(symbol, interval, limit)
