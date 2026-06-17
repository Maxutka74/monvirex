
import httpx
from django.core.cache import cache

from apps.assets.errors import ErrorHandler


class BinanceClient:

    def __init__(self):
        self.base_url = 'https://api.binance.com/api/'
        self.client = httpx.Client(base_url=self.base_url, timeout=5)

    def get_exchange_info(self):
        symbols_data = []

        try:
            response = self.client.get('v3/exchangeInfo')
            response.raise_for_status()
        except (httpx.TimeoutException, httpx.RequestError, httpx.HTTPStatusError) as e:
            ErrorHandler.handle_httpx_error(e)
        data = response.json()
        symbols = data['symbols']
        for symbol in symbols:
            if symbol['status'] == 'TRADING' and symbol['symbol'].endswith('USDT'):
                symbols_data.append(
                    {
                        'symbol': symbol['symbol'],
                        'status': symbol['status'],
                    }
                )

        return symbols_data

    def get_all_tickers(self):
        tickets_data = []

        try:
            response = self.client.get('v3/ticker/24hr')
            response.raise_for_status()
        except (httpx.TimeoutException, httpx.RequestError, httpx.HTTPStatusError) as e:
            ErrorHandler.handle_httpx_error(e)
        data = response.json()
        for symbol in data:
            if symbol['symbol'].endswith('USDT'):
                tickets_data.append(
                    {
                        'symbol': symbol['symbol'],
                        'current_price': symbol['lastPrice'],
                        'price_change_24h': symbol['priceChangePercent'],
                        'volume_24h': symbol['volume'],
                    }
                )

        return tickets_data

    def get_klines(self, symbol: str, interval: str, limit: int = 500):
        key = f"klines:{symbol}:{interval}"
        klines_data = []

        klines_cash = cache.get(key)
        if klines_cash:
            return klines_cash
        try:
            response = self.client.get('v3/klines', params={'symbol': symbol, 'interval': interval, 'limit': limit})
            response.raise_for_status()
        except (httpx.TimeoutException, httpx.RequestError, httpx.HTTPStatusError) as e:
            ErrorHandler.handle_httpx_error(e)
        data = response.json()

        for kline in data:

            klines_data.append({
                "time": kline[0] // 1000,
                "open": kline[1],
                "high": kline[2],
                "low": kline[3],
                "close": kline[4],
                "volume": kline[5],
            })

        cache.set(key, klines_data, timeout=60*10)

        return klines_data
