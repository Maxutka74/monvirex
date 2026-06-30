from decimal import Decimal
from unittest.mock import patch

from django.core.cache import cache
from django.test import TestCase
from rest_framework.exceptions import ValidationError
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.assets.models import Asset
from apps.auth_app.services.auth_service import AuthService
from apps.trades.services.trade_service import TradeService
from apps.wallet.models import CryptoWallet, Wallet


# Create your tests here.
class TradeServiceTest(TestCase):
    def setUp(self):
        patches = patch('apps.auth_app.tasks.send_email.apply_async')
        self.mock_send_email = patches.start()
        self.addCleanup(patches.stop)

        self.register_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'test@gmail.com',
            'password': 'Test1234!',
        }
        self.user = self._register_and_confirm_user()

        wallet = Wallet.objects.get(user=self.user)
        wallet.balance = 10000
        wallet.save()
        self.asset_btc = Asset.objects.create(
            symbol='BTCUSDT',
            name='BTC',
            current_price=50000,
            price_change_24h=0,
            volume_24h=0,
        )
        self.asset_eth = Asset.objects.create(
            symbol='ETHUSDT',
            name='ETH',
            current_price=2000,
            price_change_24h=0,
            volume_24h=0,
        )

    def _register_and_confirm_user(self):
        response = AuthService.register(self.register_data)
        reg_id = response['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']
        user, _ = AuthService.confirm_register({'reg_id': reg_id, 'code': code})
        return user

    def test_buy_success(self):
        buy = TradeService.buy(self.user, 'BTCUSDT', 1000)
        self.assertEqual(buy['status'], 'completed')
        wallet = Wallet.objects.get(user=self.user)
        self.assertEqual(wallet.balance, 9000)
        holding = CryptoWallet.objects.get(user=self.user, asset=self.asset_btc)
        amount = round(Decimal(1000 / 50000), 10)
        self.assertEqual(holding.amount, amount)

    def test_buy_updates_existing_holding_average_price(self):
        TradeService.buy(self.user, 'BTCUSDT', 1000)
        holding = CryptoWallet.objects.get(user=self.user, asset=self.asset_btc)
        first_amount = holding.amount
        self.assertEqual(holding.average_buy_price, Decimal(50000))

        self.asset_btc.current_price = 80000
        self.asset_btc.save()

        TradeService.buy(self.user, 'BTCUSDT', 2000)
        holding.refresh_from_db()

        second_amount = Decimal(2000) / Decimal(80000)
        expected_avg = (
            (first_amount * Decimal('50000')) + (second_amount * Decimal('80000'))
        ) / (first_amount + second_amount)

        self.assertAlmostEqual(holding.amount, first_amount + second_amount)
        self.assertAlmostEqual(holding.average_buy_price, expected_avg, places=6)

    def test_buy_asset_not_found(self):
        with self.assertRaises(ValidationError) as e:
            TradeService.buy(self.user, 'BTCUSDTSJCS', 1000)
        self.assertEqual(e.exception.detail['detail'], 'Asset not found')

    def test_buy_insufficient_balance(self):
        with self.assertRaises(ValidationError) as e:
            TradeService.buy(self.user, 'BTCUSDT', 100000)
        self.assertEqual(e.exception.detail['detail'], 'Insufficient balance')

    def test_buy_wallet_does_not_exist(self):
        Wallet.objects.get(user=self.user).delete()
        with self.assertRaises(ValidationError) as e:
            TradeService.buy(self.user, 'BTCUSDT', 100)
        self.assertEqual(e.exception.detail['detail'], 'Wallet does not exist')

    def test_sell_success(self):
        TradeService.buy(self.user, 'BTCUSDT', 10000)

        sell = TradeService.sell(self.user, 'BTCUSDT', round(Decimal(0.1), 10))
        self.assertEqual(sell['status'], 'completed')
        wallet = Wallet.objects.get(user=self.user)
        self.assertEqual(wallet.balance, 5000)
        holding = CryptoWallet.objects.get(user=self.user, asset=self.asset_btc)
        self.assertEqual(holding.amount, round(Decimal(0.1), 10))

    def test_sell_full_amount_deletes_holding(self):
        TradeService.buy(self.user, 'BTCUSDT', 10000)

        TradeService.sell(self.user, 'BTCUSDT', round(Decimal(0.2), 10))
        self.assertFalse(
            CryptoWallet.objects.filter(user=self.user, asset=self.asset_btc).exists()
        )

    def test_sell_asset_not_found(self):
        TradeService.buy(self.user, 'BTCUSDT', 10000)

        with self.assertRaises(ValidationError) as e:
            TradeService.sell(self.user, 'BTCUsdcsdSDT', 0.1)
        self.assertEqual(e.exception.detail['detail'], 'Asset not found')

    def test_sell_insufficient_crypto(self):
        TradeService.buy(self.user, 'BTCUSDT', 10000)

        with self.assertRaises(ValidationError) as e:
            TradeService.sell(self.user, 'BTCUSDT', 10000)

        self.assertEqual(
            e.exception.detail['detail'], 'Wallet balance is lower than amount crypto'
        )

    def test_sell_no_holding(self):

        with self.assertRaises(ValidationError) as e:
            TradeService.sell(self.user, 'BTCUSDT', Decimal(0.1))
        self.assertEqual(e.exception.detail['detail'], 'Crypto-Wallet does not exist')

    def test_exchange_success(self):
        TradeService.buy(self.user, 'BTCUSDT', 10000)

        exchange = TradeService.exchange(self.user, 'BTCUSDT', 'ETHUSDT', Decimal(0.1))
        self.assertEqual(exchange['status'], 'completed')
        amount_usdt = Decimal(0.1) * 50000
        amount_to = amount_usdt / 2000

        eth = CryptoWallet.objects.get(user=self.user, asset=self.asset_eth)
        self.assertEqual(eth.amount, round(amount_to, 10))

    def test_exchange_creates_new_to_holding(self):
        TradeService.buy(self.user, 'BTCUSDT', 10000)

        self.assertFalse(
            CryptoWallet.objects.filter(user=self.user, asset=self.asset_eth).exists()
        )
        TradeService.exchange(self.user, 'BTCUSDT', 'ETHUSDT', Decimal(0.1))
        self.assertTrue(
            CryptoWallet.objects.filter(user=self.user, asset=self.asset_eth).exists()
        )

    def test_exchange_updates_existing_to_holding_average_price(self):
        TradeService.buy(self.user, 'BTCUSDT', 5000)
        TradeService.buy(self.user, 'ETHUSDT', 5000)

        crypto_wallet_to = CryptoWallet.objects.get(
            user=self.user, asset=self.asset_eth
        )

        TradeService.exchange(self.user, 'BTCUSDT', 'ETHUSDT', Decimal(0.099))

        amount_usdt = Decimal(0.1) * 50000
        amount_to = amount_usdt / 2000

        average_buy_price = (
            (crypto_wallet_to.amount * crypto_wallet_to.average_buy_price)
            + (amount_to * 2000)
        ) / (crypto_wallet_to.amount + amount_to)
        self.assertEqual(
            crypto_wallet_to.average_buy_price, round(average_buy_price, 10)
        )

    def test_exchange_same_asset(self):

        with self.assertRaises(ValidationError) as e:
            TradeService.exchange(self.user, 'BTCUSDT', 'BTCUSDT', Decimal(0.1))
        self.assertEqual(e.exception.detail['detail'], 'Asset cannot be the same')

    def test_exchange_asset_not_found(self):

        with self.assertRaises(ValidationError) as e:
            TradeService.exchange(self.user, 'BTCUSDT', 'ETHUSDTrfre', Decimal(0.1))
        self.assertEqual(e.exception.detail['detail'], 'Asset not found')

    def test_exchange_no_holding(self):
        TradeService.buy(self.user, 'ETHUSDT', 10000)

        with self.assertRaises(ValidationError) as e:
            TradeService.exchange(self.user, 'BTCUSDT', 'ETHUSDT', 10000)
        self.assertEqual(e.exception.detail['detail'], 'Crypto-Wallet does not exist')

    def test_exchange_insufficient_balance(self):
        TradeService.buy(self.user, 'ETHUSDT', 5000)
        TradeService.buy(self.user, 'BTCUSDT', 5000)

        with self.assertRaises(ValidationError) as e:
            TradeService.exchange(self.user, 'BTCUSDT', 'ETHUSDT', Decimal(0.11))
        self.assertEqual(e.exception.detail['detail'], 'Insufficient crypto balance')


class TradeApiTest(APITestCase):
    def setUp(self):
        patches = patch('apps.auth_app.tasks.send_email.apply_async')
        self.mock_send_email = patches.start()
        self.addCleanup(patches.stop)

        self.register_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'test@gmail.com',
            'password': 'Test1234!',
        }

        self.user = self._register_and_confirm_user()

        self.buy_data = {'user': self.user, 'symbol': 'BTCUSDT', 'amount_usdt': 2000}

        self.sell_data = {'user': self.user, 'symbol': 'BTCUSDT', 'amount_crypto': 0.02}

        self.exchange_data = {
            'user': self.user,
            'from_asset': 'BTCUSDT',
            'to_asset': 'ETHUSDT',
            'amount_crypto': 0.02,
        }

        wallet = Wallet.objects.get(user=self.user)
        wallet.balance = 20000
        wallet.save()

        self.asset_btc = Asset.objects.create(
            symbol='BTCUSDT',
            name='BTC',
            current_price=50000,
            price_change_24h=0,
            volume_24h=0,
        )
        self.asset_eth = Asset.objects.create(
            symbol='ETHUSDT',
            name='ETH',
            current_price=2000,
            price_change_24h=0,
            volume_24h=0,
        )

    def _register_and_confirm_user(self):
        response = AuthService.register(self.register_data)
        reg_id = response['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']
        user, _ = AuthService.confirm_register({'reg_id': reg_id, 'code': code})
        return user

    def test_buy_api(self):
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)

        self.client.cookies['access_token'] = access_token

        response = self.client.post('/api/trade/buy/', data=self.buy_data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['buy']['asset'], 'BTCUSDT')

    def test_buy_api_invalid_data(self):
        self.buy_invalid_data = {
            'user': self.user,
            'symbol': 'BTCUSDTeff',
            'amount_usdt': 2000,
        }

        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)

        self.client.cookies['access_token'] = access_token

        response = self.client.post('/api/trade/buy/', data=self.buy_invalid_data)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['detail'], 'Asset not found')

    def test_buy_api_unauthorized(self):
        response = self.client.post('/api/trade/buy/', data=self.buy_data)

        self.assertEqual(response.status_code, 401)

    def test_sell_api(self):
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)

        self.client.cookies['access_token'] = access_token

        self.client.post('/api/trade/buy/', data=self.buy_data)

        response = self.client.post('/api/trade/sell/', data=self.sell_data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['sell']['asset'], 'BTCUSDT')

    def test_sell_api_unauthorized(self):
        response = self.client.post('/api/trade/sell/', data=self.sell_data)

        self.assertEqual(response.status_code, 401)

    def test_exchange_api(self):
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)

        self.client.cookies['access_token'] = access_token

        self.client.post('/api/trade/buy/', data=self.buy_data)

        response = self.client.post('/api/trade/exchange/', data=self.exchange_data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data['exchange']['to_holding']['amount'], Decimal('0.5000000000')
        )

    def test_exchange_api_unauthorized(self):
        response = self.client.post('/api/trade/exchange/', data=self.exchange_data)

        self.assertEqual(response.status_code, 401)
