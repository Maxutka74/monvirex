from unittest.mock import Mock, patch

import httpx
from django.test import TestCase

from apps.assets.models import Asset
from apps.assets.selectors import AssetSelector
from apps.assets.errors import BinanceAPIError


# Create your tests here.

class AssetSelectorTest(TestCase):
    def test_get_assets_returns_only_active(self):
        Asset.objects.create(symbol="BTC", name="BTC", is_active=True, current_price=1, price_change_24h=0, volume_24h=0)
        Asset.objects.create(symbol="ETH", name="ETH", is_active=False, current_price=1, price_change_24h=0,volume_24h=0)

        asset = AssetSelector.get_assets()

        symbols = [i.symbol for i in asset]

        self.assertIn('BTC', symbols)
        self.assertNotIn('ETH', symbols)

        self.assertEqual(1, len(asset))

    def test_get_asset_returns_correct_symbol(self):
        Asset.objects.create(symbol="BTC", name="BTC", is_active=True, current_price=1, price_change_24h=0, volume_24h=0)

        asset = AssetSelector.get_asset(symbol="BTC")

        self.assertIsNotNone(asset)
        self.assertEqual(asset.symbol, "BTC")

    def test_get_asset_returns_none_if_missing(self):
        asset = AssetSelector.get_asset(symbol="BTC")

        self.assertIsNone(asset)

    def test_timeout_error(self):
        err = httpx.TimeoutException("Binance timeout")

        with self.assertRaises(BinanceAPIError) as exc:
            raise BinanceAPIError(str(err))

        self.assertIn("Binance timeout", str(exc.exception))

    def test_request_error(self):
        err = httpx.RequestError("Binance connection error")

        with self.assertRaises(BinanceAPIError) as exc:
            raise BinanceAPIError(str(err))

        self.assertIn("Binance connection error", str(exc.exception))

    def test_http_status_error(self):
        request = httpx.Request('GET', 'https://api.binance.com')
        response = httpx.Response(400, request=request)

        err = httpx.HTTPStatusError("Invalid Binance response", request=request, response=response)

        with self.assertRaises(BinanceAPIError) as exc:
            raise BinanceAPIError(str(err))

        self.assertIn("Invalid Binance response", str(exc.exception))

    def test_unknown_error(self):
        err = httpx.LocalProtocolError("Unknown Binance error")

        with self.assertRaises(BinanceAPIError) as exc:
            raise BinanceAPIError(str(err))

        self.assertIn("Unknown Binance error", str(exc.exception))

class AssetSAPITest(TestCase):
    def test_asset_list_api(self):
        res = self.client.get('/api/crypto/assets/')

        self.assertEqual(res.status_code, 200)
        self.assertIn('results', res.data)

    def test_asset_list_only_active_api(self):
        Asset.objects.create(symbol="BTC", name="BTC", is_active=True, current_price=1, price_change_24h=0, volume_24h=0)
        Asset.objects.create(symbol="ETH", name="ETH", is_active=False, current_price=1, price_change_24h=0,volume_24h=0)

        res = self.client.get('/api/crypto/assets/')

        symbols = [i['symbol'] for i in res.data['results']]

        self.assertEqual(res.status_code, 200)
        self.assertIn('BTC', symbols)
        self.assertNotIn('ETH', symbols)

    def test_asset_detail_api(self):
        Asset.objects.create(symbol="BTC", name="BTC", is_active=True, current_price=1, price_change_24h=0,volume_24h=0)

        res = self.client.get('/api/crypto/assets/BTC/')

        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['symbol'], 'BTC')

    def test_asset_detail_not_found_api(self):
        res = self.client.get('/api/crypto/assets/BTC/')

        self.assertEqual(res.status_code, 404)

    @patch('apps.assets.service.binance.service.AssetService.get_klines_asset')
    def test_klines_api(self,mock_klines):
        mock_klines.return_value = [
            {
                "time": 1,
                "open": "100",
                "high": "110",
                "low": "90",
                "close": "105",
                "volume": "10",
            }
        ]

        res = self.client.get('/api/crypto/assets/klines/ETHUSDT/15m/300/')

        self.assertEqual(res.status_code, 200)
        self.assertIn('time', res.data[0])

    def test_klines_not_found_api(self):
        res = self.client.get('/api/crypto/assets/klines/ETHUSDTt/15m/300/')

        self.assertEqual(res.status_code, 500)
