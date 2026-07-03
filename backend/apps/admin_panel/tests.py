from unittest.mock import patch

from django.core.cache import cache
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.assets.models import Asset
from apps.auth_app.services.auth_service import AuthService
from apps.wallet.models import CryptoTransaction, Transaction, Wallet


# Create your tests here.
class PermissionsApiTest(APITestCase):
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
        self.admin_user = {
            'first_name': 'Maxx',
            'last_name': 'Grov',
            'email': 'test1@gmail.com',
            'password': 'Test1234!',
        }

        self.user_one = self._register_and_confirm_user(self.first_user)
        self.user_admin = self._register_and_confirm_user(self.admin_user)
        self.user_admin.is_staff = True
        self.user_admin.save()

    def _register_and_confirm_user(self, data):
        response = AuthService.register(data)
        reg_id = response['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']
        user, _ = AuthService.confirm_register({'reg_id': reg_id, 'code': code})
        return user

    def test_user_not_authenticated(self):
        response = self.client.get('/api/admin-panel/users/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_not_admin(self):
        refresh = RefreshToken.for_user(self.user_one)
        self.client.cookies['access_token'] = str(refresh.access_token)

        response = self.client.get('/api/admin-panel/users/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_admin(self):
        refresh = RefreshToken.for_user(self.user_admin)
        self.client.cookies['access_token'] = str(refresh.access_token)

        response = self.client.get('/api/admin-panel/users/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)


class AdminApiTest(APITestCase):
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
        self.second_user = {
            'first_name': 'Glib',
            'last_name': 'Brethov',
            'email': 'test23@gmail.com',
            'password': 'Test1234!',
        }
        self.admin_user = {
            'first_name': 'Maxx',
            'last_name': 'Grov',
            'email': 'test1@gmail.com',
            'password': 'Test1234!',
        }

        self.user_one = self._register_and_confirm_user(self.first_user)
        self.user_two = self._register_and_confirm_user(self.second_user)
        self.user_admin = self._register_and_confirm_user(self.admin_user)
        self.user_admin.is_staff = True
        self.user_admin.save()

        Wallet.objects.filter(user=self.user_one).update(balance=10000)
        Wallet.objects.filter(user=self.user_two).update(balance=80000)

        Asset.objects.create(
            symbol='BTCUSDT',
            name='BTC',
            current_price=50000,
            price_change_24h=0,
            volume_24h=0,
        )
        Asset.objects.create(
            symbol='ETHUSDT',
            name='ETH',
            current_price=2000,
            price_change_24h=0,
            volume_24h=0,
        )

    def _register_and_confirm_user(self, data):
        response = AuthService.register(data)
        reg_id = response['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']
        user, _ = AuthService.confirm_register({'reg_id': reg_id, 'code': code})
        return user

    def test_list_users(self):
        refresh = RefreshToken.for_user(self.user_admin)
        self.client.cookies['access_token'] = str(refresh.access_token)

        response = self.client.get('/api/admin-panel/users/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 3)

    def test_user_email(self):
        refresh = RefreshToken.for_user(self.user_admin)
        self.client.cookies['access_token'] = str(refresh.access_token)

        response = self.client.get('/api/admin-panel/users/?search=test23')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['email'], 'test23@gmail.com')
        self.assertEqual(response.data['count'], 1)

    def test_user_detail(self):
        refresh = RefreshToken.for_user(self.user_admin)
        self.client.cookies['access_token'] = str(refresh.access_token)

        response = self.client.get(f'/api/admin-panel/users/{self.user_one.id}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['wallet_balance'], '10000.00')
        self.assertEqual(response.data['email'], 'test@gmail.com')

    def test_user_toggle(self):
        refresh = RefreshToken.for_user(self.user_admin)
        self.client.cookies['access_token'] = str(refresh.access_token)

        response_one = self.client.patch(
            f'/api/admin-panel/users/{self.user_one.id}/toggle-active/'
        )

        self.assertEqual(response_one.status_code, status.HTTP_200_OK)
        self.assertEqual(response_one.data['is_active'], False)

        response_two = self.client.patch(
            f'/api/admin-panel/users/{self.user_one.id}/toggle-active/'
        )

        self.assertEqual(response_two.status_code, status.HTTP_200_OK)
        self.assertEqual(response_two.data['is_active'], True)

    def test_users_transactions(self):
        first_transaction = Transaction.objects.create(
            user=self.user_one,
            transaction_type='deposit',
            amount='1000',
            status='completed',
        )
        second_transaction = Transaction.objects.create(
            user=self.user_two,
            transaction_type='deposit',
            amount='10040',
            status='completed',
        )

        refresh = RefreshToken.for_user(self.user_admin)
        self.client.cookies['access_token'] = str(refresh.access_token)

        response = self.client.get('/api/admin-panel/transactions/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(response.data['results'][0]['id'], str(second_transaction.id))
        self.assertEqual(response.data['results'][1]['id'], str(first_transaction.id))

    def test_users_crypto_transactions(self):
        first_transaction = CryptoTransaction.objects.create(
            user=self.user_one,
            asset='BTCUSDT',
            usdt_amount=1000,
            crypto_amount=0.0001,
            transaction_type='buy',
            status='completed',
        )
        second_transaction = CryptoTransaction.objects.create(
            user=self.user_two,
            asset='ETHUSDT',
            usdt_amount=1200,
            crypto_amount=0.01,
            transaction_type='buy',
            status='completed',
        )

        refresh = RefreshToken.for_user(self.user_admin)
        self.client.cookies['access_token'] = str(refresh.access_token)

        response = self.client.get('/api/admin-panel/crypto-transactions/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(response.data['results'][0]['id'], str(second_transaction.id))
        self.assertEqual(response.data['results'][1]['id'], str(first_transaction.id))

    def test_asset_toggle(self):
        refresh = RefreshToken.for_user(self.user_admin)
        self.client.cookies['access_token'] = str(refresh.access_token)

        response_one = self.client.patch(
            '/api/admin-panel/assets/BTCUSDT/toggle-active/'
        )

        self.assertEqual(response_one.status_code, status.HTTP_200_OK)
        self.assertEqual(response_one.data['is_active'], False)

        response_two = self.client.patch(
            '/api/admin-panel/assets/BTCUSDT/toggle-active/'
        )

        self.assertEqual(response_two.status_code, status.HTTP_200_OK)
        self.assertEqual(response_two.data['is_active'], True)

    @patch('apps.admin_panel.services.admin_services.sync_assets_task')
    def test_asset_sync(self, mock_sync_assets_task):
        refresh = RefreshToken.for_user(self.user_admin)
        self.client.cookies['access_token'] = str(refresh.access_token)

        response = self.client.post('/api/admin-panel/assets/sync/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        mock_sync_assets_task.delay.assert_called_once()

    def test_stats(self):
        Transaction.objects.create(
            user=self.user_one,
            transaction_type='deposit',
            amount='1000',
            status='completed',
        )
        CryptoTransaction.objects.create(
            user=self.user_one,
            asset='BTCUSDT',
            usdt_amount=1000,
            crypto_amount=0.0001,
            transaction_type='buy',
            status='completed',
        )

        refresh = RefreshToken.for_user(self.user_admin)
        self.client.cookies['access_token'] = str(refresh.access_token)

        response = self.client.get('/api/admin-panel/stats/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_users'], 3)
        self.assertEqual(response.data['total_wallet_balance'], '90000.00')
        self.assertEqual(response.data['total_transactions_24h'], 1)
        self.assertEqual(response.data['total_crypto_transaction_24h'], 1)
        self.assertEqual(response.data['total_crypto_value'], '0.0000000000')
        self.assertEqual(response.data['total_portfolio_value'], '90000.0000000000')
        self.assertEqual(response.data['total_snapshots_count'], 0)