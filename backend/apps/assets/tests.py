from unittest.mock import patch

import httpx
from django.core.cache import cache
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.assets.errors import BinanceAPIError
from apps.assets.models import Asset
from apps.assets.selectors import AssetSelector
from apps.auth_app.services.auth_service import AuthService

# Create your tests here.


class AssetSelectorTest(TestCase):
    def test_get_assets_returns_only_active(self):
        Asset.objects.create(
            symbol='BTC',
            name='BTC',
            is_active=True,
            current_price=1,
            price_change_24h=0,
            volume_24h=0,
        )
        Asset.objects.create(
            symbol='ETH',
            name='ETH',
            is_active=False,
            current_price=1,
            price_change_24h=0,
            volume_24h=0,
        )

        asset = AssetSelector.get_assets()

        symbols = [i.symbol for i in asset]

        self.assertIn('BTC', symbols)
        self.assertNotIn('ETH', symbols)

        self.assertEqual(1, len(asset))

    def test_get_asset_returns_correct_symbol(self):
        Asset.objects.create(
            symbol='BTC',
            name='BTC',
            is_active=True,
            current_price=1,
            price_change_24h=0,
            volume_24h=0,
        )

        asset = AssetSelector.get_asset(symbol='BTC')

        self.assertIsNotNone(asset)
        self.assertEqual(asset.symbol, 'BTC')

    def test_get_asset_returns_none_if_missing(self):
        asset = AssetSelector.get_asset(symbol='BTC')

        self.assertIsNone(asset)

    def test_timeout_error(self):
        err = httpx.TimeoutException('Binance timeout')

        with self.assertRaises(BinanceAPIError) as exc:
            raise BinanceAPIError(str(err))

        self.assertIn('Binance timeout', str(exc.exception))

    def test_request_error(self):
        err = httpx.RequestError('Binance connection error')

        with self.assertRaises(BinanceAPIError) as exc:
            raise BinanceAPIError(str(err))

        self.assertIn('Binance connection error', str(exc.exception))

    def test_http_status_error(self):
        request = httpx.Request('GET', 'https://api.binance.com')
        response = httpx.Response(400, request=request)

        err = httpx.HTTPStatusError(
            'Invalid Binance response', request=request, response=response
        )

        with self.assertRaises(BinanceAPIError) as exc:
            raise BinanceAPIError(str(err))

        self.assertIn('Invalid Binance response', str(exc.exception))

    def test_unknown_error(self):
        err = httpx.LocalProtocolError('Unknown Binance error')

        with self.assertRaises(BinanceAPIError) as exc:
            raise BinanceAPIError(str(err))

        self.assertIn('Unknown Binance error', str(exc.exception))


class AssetsAPITest(TestCase):
    def setUp(self):
        patches = patch('apps.auth_app.tasks.send_email.apply_async')
        self.mock_send_email = patches.start()
        self.addCleanup(patches.stop)

        self.first_user = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'test@gmail.com',
            'password': 'Test1234!',
        }

        self.user_one = self._register_and_confirm_user(self.first_user)

    def _register_and_confirm_user(self, data):
        response = AuthService.register(data)
        reg_id = response['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']
        user, _ = AuthService.confirm_register({'reg_id': reg_id, 'code': code})
        return user

    def _auth(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.cookies['access_token'] = str(refresh.access_token)

    def test_asset_list_api(self):
        self._auth(user=self.user_one)

        res = self.client.get('/api/crypto/assets/')

        self.assertEqual(res.status_code, 200)
        self.assertIn('results', res.data)

    def test_asset_list_only_active_api(self):
        self._auth(user=self.user_one)

        Asset.objects.create(
            symbol='BTC',
            name='BTC',
            is_active=True,
            current_price=1,
            price_change_24h=0,
            volume_24h=0,
        )
        Asset.objects.create(
            symbol='ETH',
            name='ETH',
            is_active=False,
            current_price=1,
            price_change_24h=0,
            volume_24h=0,
        )

        res = self.client.get('/api/crypto/assets/')

        symbols = [i['symbol'] for i in res.data['results']]

        self.assertEqual(res.status_code, 200)
        self.assertIn('BTC', symbols)
        self.assertNotIn('ETH', symbols)

    def test_asset_detail_api(self):
        self._auth(user=self.user_one)

        Asset.objects.create(
            symbol='BTC',
            name='BTC',
            is_active=True,
            current_price=1,
            price_change_24h=0,
            volume_24h=0,
        )

        res = self.client.get('/api/crypto/assets/BTC/')

        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['symbol'], 'BTC')

    def test_asset_detail_not_found_api(self):
        self._auth(user=self.user_one)

        res = self.client.get('/api/crypto/assets/BTC/')

        self.assertEqual(res.status_code, 404)

    @patch('apps.assets.service.binance.service.AssetService.get_klines_asset')
    def test_klines_api(self, mock_klines):
        self._auth(user=self.user_one)

        mock_klines.return_value = [
            {
                'time': 1,
                'open': '100',
                'high': '110',
                'low': '90',
                'close': '105',
                'volume': '10',
            }
        ]

        res = self.client.get('/api/crypto/assets/klines/ETHUSDT/15m/300/')

        self.assertEqual(res.status_code, 200)
        self.assertIn('time', res.data[0])

    def test_klines_not_found_api(self):
        self._auth(user=self.user_one)

        res = self.client.get('/api/crypto/assets/klines/ETHUSDTt/15m/300/')

        self.assertEqual(res.status_code, 500)

    def test_top_movers_requires_auth(self):

        res = self.client.get('/api/crypto/assets/top-movers/?limit=2')

        self.assertEqual(res.status_code, 401)

    def test_top_movers_success(self):
        self._auth(user=self.user_one)

        Asset.objects.create(
            symbol='BTCUSDT',
            name='BTC',
            is_active=True,
            current_price=1,
            price_change_24h=15,
            volume_24h=4,
        )

        Asset.objects.create(
            symbol='ETHUSDT',
            name='ETH',
            is_active=True,
            current_price=1,
            price_change_24h=10,
            volume_24h=3,
        )

        res = self.client.get('/api/crypto/assets/top-movers/?limit=2')

        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['top_movers'][0]['symbol'], 'BTCUSDT')
        self.assertEqual(res.data['top_movers'][1]['symbol'], 'ETHUSDT')

    def test_top_movers_invalid_limit(self):
        self._auth(user=self.user_one)

        first_res = self.client.get('/api/crypto/assets/top-movers/?limit=fvf')

        self.assertEqual(first_res.status_code, 400)

        second_res = self.client.get('/api/crypto/assets/top-movers/?limit=0')

        self.assertEqual(second_res.status_code, 400)

    def test_top_movers_returns_only_active_assets(self):
        self._auth(user=self.user_one)

        Asset.objects.create(
            symbol='BTCUSDT',
            name='BTC',
            is_active=True,
            current_price=1,
            price_change_24h=15,
            volume_24h=4,
        )

        Asset.objects.create(
            symbol='ETHUSDT',
            name='ETH',
            is_active=False,
            current_price=1,
            price_change_24h=10,
            volume_24h=3,
        )

        res = self.client.get('/api/crypto/assets/top-movers/?limit=2')

        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data['top_movers']), 1)
        self.assertEqual(res.data['top_movers'][0]['symbol'], 'BTCUSDT')