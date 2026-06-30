from unittest import mock
from unittest.mock import patch

from django.core.cache import cache
from django.db import IntegrityError
from django.test import TestCase
from rest_framework.exceptions import ValidationError
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.assets.models import Asset
from apps.auth_app.services.auth_service import AuthService
from apps.trades.services.trade_service import TradeService
from apps.wallet.models import Transaction, Wallet
from apps.wallet.services.stripe_service import StripePaymentService
from apps.wallet.services.wallet_service import WalletService
from wallet.services.crypto_service import CryptoWalletService

# Create your tests here.


class WalletServiceTest(TestCase):
    def setUp(self):
        patches = patch(
            'apps.wallet.services.stripe_service.StripePaymentService.create_checkout_session'
        )
        patches_two = patch('apps.auth_app.tasks.send_email.apply_async')
        self.mock_send_email = patches_two.start()
        self.mock_create_checkout_session = patches.start()
        self.addCleanup(patches.stop)
        self.addCleanup(patches_two.stop)
        self.mock_create_checkout_session.return_value = (
            'https://checkout.test/session_123'
        )

        self.register_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'test@gmail.com',
            'password': 'Test1234!',
        }

    def _register_and_confirm_user(self):
        response = AuthService.register(self.register_data)
        reg_id = response['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']
        user, _ = AuthService.confirm_register({'reg_id': reg_id, 'code': code})
        return user

    def test_get_balance(self):
        user = self._register_and_confirm_user()

        first_response = WalletService.get_balance(user)

        self.assertIsNotNone(first_response)
        self.assertEqual(first_response, 0)

        wallet = Wallet.objects.get(user=user)
        wallet.balance = 200
        wallet.save()

        second_response = WalletService.get_balance(user)

        self.assertEqual(second_response, 200)

    def test_get_transaction_history(self):
        user = self._register_and_confirm_user()

        t1 = Transaction.objects.create(
            user=user, transaction_type='deposit', amount=100
        )
        t2 = Transaction.objects.create(
            user=user, transaction_type='withdraw', amount=50
        )

        transaction_history = WalletService.get_transaction_history(user)

        self.assertIsNotNone(transaction_history)
        self.assertEqual(transaction_history.count(), 2)

        self.assertEqual(transaction_history[0], t2)
        self.assertEqual(transaction_history[1], t1)

    def test_deposit_success(self):
        user = self._register_and_confirm_user()

        response = WalletService.deposit(user, 150)

        self.assertIn('transaction_id', response)
        self.assertIn('checkout_url', response)

        self.assertEqual(response['checkout_url'], 'https://checkout.test/session_123')

        self.mock_create_checkout_session.assert_called_once()

    def test_deposit_duplicate_idempotency_key(self):
        user = self._register_and_confirm_user()

        key = 'test-key'

        first_response = WalletService.deposit(user, 150, idempotency_key=key)
        second_response = WalletService.deposit(user, 150, idempotency_key=key)

        self.assertIsNotNone(first_response)
        self.assertIsNotNone(second_response)

        self.assertEqual(
            second_response['transaction_id'], first_response['transaction_id']
        )

        self.mock_create_checkout_session.assert_called_once()

    @patch('apps.wallet.services.wallet_service.Transaction.objects.create')
    def test_db_duplicate_integrity_error(self, mock_create):
        user = self._register_and_confirm_user()
        mock_create.side_effect = IntegrityError()

        with self.assertRaises(ValidationError) as e:
            WalletService.deposit(user, 150)

        self.assertEqual(e.exception.detail['detail'], 'Duplicate transaction request')

    def test_withdraw_success(self):
        user = self._register_and_confirm_user()

        wallet = Wallet.objects.get(user=user)
        wallet.balance = 200
        wallet.save()

        response = WalletService.withdraw(user, 150)

        self.assertIn('transaction_id', response)

        self.assertEqual(response['balance_after'], '50.00')

        self.assertEqual(response['status'], 'completed')

    def test_withdraw_insufficient_balance(self):
        user = self._register_and_confirm_user()

        wallet = Wallet.objects.get(user=user)
        wallet.balance = 200
        wallet.save()

        with self.assertRaises(ValidationError) as e:
            WalletService.withdraw(user, 300)

        self.assertEqual(e.exception.detail['detail'], 'Insufficient balance')

    @patch('apps.wallet.services.wallet_service.Transaction.objects.create')
    def test_withdraw_duplicate_idempotency_key(self, mock_create):
        user = self._register_and_confirm_user()
        mock_create.side_effect = IntegrityError()

        wallet = Wallet.objects.get(user=user)
        wallet.balance = 200
        wallet.save()

        with self.assertRaises(ValidationError) as e:
            WalletService.withdraw(user, 150)

        self.assertEqual(e.exception.detail['detail'], 'Duplicate transaction request')


class StripeServiceTest(TestCase):
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

    def _register_and_confirm_user(self):
        response = AuthService.register(self.register_data)
        reg_id = response['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']
        user, _ = AuthService.confirm_register({'reg_id': reg_id, 'code': code})
        return user

    def test_handle_success(self):
        user = self._register_and_confirm_user()

        tx = Transaction.objects.create(
            user=user,
            transaction_type='deposit',
            amount=100,
            stripe_session_id='sess_123',
        )
        tx.save()

        wallet = Wallet.objects.get(user=user)
        wallet.balance = 200
        wallet.save()

        session = type('obj', (), {})()
        session.id = 'sess_123'
        session.to_dict = lambda: {
            'id': 'sess_123',
            'metadata': {'transaction_id': str(tx.id)},
        }

        StripePaymentService.handle_success(session)

        tx.refresh_from_db()
        wallet.refresh_from_db()

        self.assertEqual(tx.status, 'completed')
        self.assertEqual(wallet.balance, 300)
        self.assertEqual(tx.stripe_session_id, session.id)

    def test_handle_success_transaction_not_found(self):
        session = type('obj', (), {})()
        session.id = 'sess_123'
        session.to_dict = lambda: {
            'id': 'sess_123',
            'metadata': {'transaction_id': '3fa00f11-5717-1111-b3fc-2c963f66afa5'},
        }

        with self.assertRaises(ValidationError) as e:
            StripePaymentService.handle_success(session)

        self.assertEqual(e.exception.detail['detail'], 'Transaction not found')

    def test_handle_success_session_mismatch(self):
        user = self._register_and_confirm_user()

        tx = Transaction.objects.create(
            user=user, transaction_type='deposit', amount=100, stripe_session_id='sess'
        )
        tx.save()
        tx.refresh_from_db()

        session = type('obj', (), {})()
        session.id = 'sess_123'
        session.to_dict = lambda: {
            'id': 'sess_123',
            'metadata': {'transaction_id': tx.id},
        }

        with self.assertRaises(ValidationError) as e:
            StripePaymentService.handle_success(session)

        self.assertEqual(e.exception.detail['detail'], 'Stripe session mismatch')

    def test_stripe_handle_failed_success(self):
        user = self._register_and_confirm_user()

        tx = Transaction.objects.create(
            user=user, transaction_type='deposit', amount=100, status='pending'
        )
        tx.save()

        session = type('obj', (), {})()
        session.to_dict = lambda: {'metadata': {'transaction_id': tx.id}}

        result = StripePaymentService.handle_failed(session)

        tx.refresh_from_db()

        self.assertEqual(tx.status, 'failed')
        self.assertEqual(result['status'], 'failed')
        self.assertEqual(result['transaction_id'], tx.id)

    def test_handle_failed_missing_transaction_id(self):
        session = type('obj', (), {})()
        session.to_dict = lambda: {'metadata': {}}

        with self.assertRaises(ValidationError) as e:
            StripePaymentService.handle_failed(session)

        self.assertEqual(
            e.exception.detail['detail'], 'Missing transaction_id in metadata'
        )


class CryptoWalletServiceTest(TestCase):
    def setUp(self):
        patches = mock.patch('apps.auth_app.tasks.send_email.apply_async')
        self.mock_send_email = patches.start()
        self.addCleanup(patches.stop)

        self.register_data_first_user = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'test@gmail.com',
            'password': 'Test1234!',
        }

        self.register_data_other_user = {
            'first_name': 'Maxx',
            'last_name': 'Vagov',
            'email': 'test2@gmail.com',
            'password': 'Test1234!',
        }

        self.first_user = self._register_and_confirm_user(self.register_data_first_user)
        self.other_user = self._register_and_confirm_user(self.register_data_other_user)

        wallet = Wallet.objects.get(user=self.first_user)
        wallet.balance = 20000
        wallet.save()

        wallet = Wallet.objects.get(user=self.other_user)
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

    def _register_and_confirm_user(self, register_data):
        response = AuthService.register(register_data)
        reg_id = response['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']
        user, _ = AuthService.confirm_register({'reg_id': reg_id, 'code': code})
        return user

    def test_get_portfolio_returns_user_holdings(self):
        TradeService.buy(self.first_user, 'BTCUSDT', 5000)
        TradeService.buy(self.other_user, 'ETHUSDT', 5000)

        portfolio = CryptoWalletService.get_portfolio(user=self.first_user)

        self.assertEqual(portfolio.count(), 1)
        self.assertEqual(portfolio.first().asset.symbol, 'BTCUSDT')
        self.assertEqual(portfolio.first().user, self.first_user)

    def test_get_portfolio_empty(self):

        portfolio = CryptoWalletService.get_portfolio(user=self.first_user)
        self.assertEqual(portfolio.count(), 0)

    def test_get_crypto_transaction_history(self):
        TradeService.buy(self.first_user, 'BTCUSDT', 5000)
        TradeService.buy(self.first_user, 'ETHUSDT', 10000)

        history = CryptoWalletService.get_crypto_transaction_history(
            user=self.first_user
        )

        self.assertEqual(history.count(), 2)
        self.assertEqual(history.first().asset, 'ETHUSDT')

    def test_get_crypto_transaction_history_empty(self):

        history = CryptoWalletService.get_crypto_transaction_history(
            user=self.first_user
        )

        self.assertEqual(history.count(), 0)


class WalletServiceApiTest(APITestCase):
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

    def _register_and_confirm_user(self):
        response = AuthService.register(self.register_data)
        reg_id = response['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']
        user, _ = AuthService.confirm_register({'reg_id': reg_id, 'code': code})
        return user

    def test_balance_api(self):
        user = self._register_and_confirm_user()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        self.client.cookies['access_token'] = access_token

        response = self.client.get('/api/payment/balance/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user'], self.register_data['email'])
        self.assertEqual(response.data['balance'], '0.00')

    def test_balance_unauthorized_api(self):
        response = self.client.get('/api/payment/balance/')

        self.assertEqual(response.status_code, 401)

    def test_transaction_history_api(self):
        user = self._register_and_confirm_user()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        self.client.cookies['access_token'] = access_token

        Transaction.objects.create(
            user=user, transaction_type='deposit', amount=100, stripe_session_id='sess1'
        )
        Transaction.objects.create(
            user=user, transaction_type='deposit', amount=200, stripe_session_id='sess2'
        )

        response = self.client.get('/api/payment/transactions/')

        self.assertEqual(response.status_code, 200)
        self.assertIn('transactions', response.data)
        self.assertEqual(len(response.data['transactions']), 2)

    def test_transaction_history_unauthorized_api(self):
        response = self.client.get('/api/payment/transactions/')

        self.assertEqual(response.status_code, 401)

    def test_deposit_api(self):
        user = self._register_and_confirm_user()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        self.client.cookies['access_token'] = access_token

        response = self.client.post(
            '/api/payment/deposit/',
            data={
                'idempotency_key': '3fa85f64-0027-4562-b3fc-2c963f66afa6',
                'amount': 195.4,
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('transaction_id', response.data)
        self.assertIn('checkout_url', response.data)

    def test_deposit_invalid_api(self):
        user = self._register_and_confirm_user()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        self.client.cookies['access_token'] = access_token

        response = self.client.post(
            '/api/payment/deposit/',
            data={
                'idempotency_key': '3fa85f64-0027-4562-b3fc-2c963f66afa6',
                'amount': '-100',
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.data['amount'][0],
            'Ensure this value is greater than or equal to 0.01.',
        )

    def test_deposit_unauthorized_api(self):
        response = self.client.post(
            '/api/payment/deposit/',
            data={
                'idempotency_key': '3fa85f64-0027-4562-b3fc-2c963f66afa6',
                'amount': '100',
            },
        )

        self.assertEqual(response.status_code, 401)

    def test_withdraw_api(self):
        user = self._register_and_confirm_user()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        self.client.cookies['access_token'] = access_token

        wallet = Wallet.objects.get(user=user)
        wallet.balance = 200
        wallet.save()

        response = self.client.post(
            '/api/payment/withdraw/',
            data={
                'idempotency_key': '3fa85f64-1831-4562-b3fc-2c963f66afa6',
                'amount': '25',
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('transaction_id', response.data)
        self.assertIn('status', response.data)

    def test_withdraw_invalid_api(self):
        user = self._register_and_confirm_user()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        self.client.cookies['access_token'] = access_token

        wallet = Wallet.objects.get(user=user)
        wallet.balance = 200
        wallet.save()

        response = self.client.post(
            '/api/payment/withdraw/',
            data={
                'idempotency_key': '3fa85f64-1831-4562-b3fc-2c963f66afa6',
                'amount': '250',
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['detail'], 'Insufficient balance')

    def test_withdraw_unauthorized_api(self):
        response = self.client.post(
            '/api/payment/withdraw/',
            data={
                'idempotency_key': '3fa85f64-1831-4562-b3fc-2c963f66afa6',
                'amount': '25',
            },
        )

        self.assertEqual(response.status_code, 401)


class PortfolioApiTest(APITestCase):
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

    def test_portfolio_api(self):
        TradeService.buy(self.user, 'BTCUSDT', 1000)

        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)

        self.client.cookies['access_token'] = access_token

        response = self.client.get('/api/payment/portfolio/')

        self.assertEqual(response.status_code, 200)
        self.assertIn('current_value', response.data['portfolio'][0])

    def test_portfolio_api_empty(self):
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)

        self.client.cookies['access_token'] = access_token

        response = self.client.get('/api/payment/portfolio/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['portfolio'], [])

    def test_portfolio_api_unauthorized(self):

        response = self.client.get('/api/payment/portfolio/')

        self.assertEqual(response.status_code, 401)
        self.assertEqual(
            response.data['detail'], 'Authentication credentials were not provided.'
        )


class CryptoTransactionApiTest(APITestCase):
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

    def test_crypto_transactions_api(self):
        TradeService.buy(self.user, 'BTCUSDT', 1000)
        TradeService.buy(self.user, 'ETHUSDT', 1000)

        refresh = RefreshToken.for_user(user=self.user)
        access_token = str(refresh.access_token)

        self.client.cookies['access_token'] = access_token

        response = self.client.get('/api/payment/crypto_transactions/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['transactions'][0]['asset'], 'ETHUSDT')
        self.assertEqual(response.data['transactions'][1]['asset'], 'BTCUSDT')

    def test_crypto_transactions_api_empty(self):

        refresh = RefreshToken.for_user(user=self.user)
        access_token = str(refresh.access_token)

        self.client.cookies['access_token'] = access_token

        response = self.client.get('/api/payment/crypto_transactions/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['transactions'], [])

    def test_crypto_transactions_api_unauthorized(self):

        response = self.client.get('/api/payment/crypto_transactions/')

        self.assertEqual(response.status_code, 401)
        self.assertEqual(
            response.data['detail'], 'Authentication credentials were not provided.'
        )
