from decimal import Decimal
from unittest.mock import patch

from auth_app.services.auth_service import AuthService
from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.assets.models import Asset
from apps.notifications.services.notification_service import NotificationService
from apps.trades.services.trade_service import TradeService
from apps.wallet.models import Wallet
from apps.wallet.services.wallet_service import WalletService


# Create your tests here.
class NotificationServiceTest(TestCase):
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
            'first_name': 'Maxx',
            'last_name': 'Doede',
            'email': 'test12@gmail.com',
            'password': 'Test1234!',
        }

        self.user_one = self._register_and_confirm_user(self.first_user)
        self.user_two = self._register_and_confirm_user(self.second_user)

    def _register_and_confirm_user(self, data):
        response = AuthService.register(data)
        reg_id = response['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']
        user, _ = AuthService.confirm_register({'reg_id': reg_id, 'code': code})
        return user

    def test_create_notification(self):
        notification = NotificationService.create_notification(
            user=self.user_one,
            notification_type='deposit',
            title='Deposit successful',
            message='Your deposit of 100 USDT has been successfully'
                    ' added to your balance',
        )

        self.assertEqual(notification.user, self.user_one)
        self.assertEqual(notification.is_read, False)

    def test_get_notifications_returns_only_user_notifications(self):
        NotificationService.create_notification(
            user=self.user_one,
            notification_type='deposit',
            title='Deposit successful',
            message='Your deposit of 100 USDT has been successfully'
                    ' added to your balance',
        )
        NotificationService.create_notification(
            user=self.user_one,
            notification_type='withdraw',
            title='Withdraw successful',
            message='Your withdrawal of 10 USD has been successfully processed.',
        )
        NotificationService.create_notification(
            user=self.user_two,
            notification_type='withdraw',
            title='Withdraw successful',
            message='Your withdrawal of 1000 USD has been successfully processed.',
        )

        notification = NotificationService.get_notifications(user=self.user_one)

        self.assertEqual(notification.first().user, self.user_one)
        self.assertEqual(notification.count(), 2)

    def test_get_notifications_returns_empty_queryset(self):

        notification = NotificationService.get_notifications(user=self.user_one)

        self.assertEqual(notification.count(), 0)

    def test_mark_as_read_marks_notification(self):
        notification_after = NotificationService.create_notification(
            user=self.user_one,
            notification_type='deposit',
            title='Deposit successful',
            message='Your deposit of 100 USDT has been successfully'
                    ' added to your balance',
        )

        self.assertEqual(notification_after.is_read, False)

        notification_before = NotificationService.mark_as_read(
            user=self.user_one, notification_id=notification_after.id
        )

        notification_before.refresh_from_db()

        self.assertEqual(notification_before.is_read, True)

    def test_mark_as_read_foreign_notification_returns_none(self):
        notification_after = NotificationService.create_notification(
            user=self.user_one,
            notification_type='deposit',
            title='Deposit successful',
            message='Your deposit of 100 USDT has been successfully'
                    ' added to your balance',
        )

        self.assertEqual(notification_after.is_read, False)

        notification_none = NotificationService.mark_as_read(
            user=self.user_two, notification_id=notification_after.id
        )

        self.assertIsNone(notification_none)

        notification_before = NotificationService.get_notifications(user=self.user_one)

        self.assertEqual(notification_before.first().is_read, False)

    def test_mark_all_as_read_marks_only_current_user_notifications(self):
        NotificationService.create_notification(
            user=self.user_one,
            notification_type='deposit',
            title='Deposit successful',
            message='Your deposit of 100 USDT has been successfully'
                    ' added to your balance',
        )
        NotificationService.create_notification(
            user=self.user_one,
            notification_type='withdraw',
            title='Withdraw successful',
            message='Your withdrawal of 10 USD has been successfully processed.',
        )
        NotificationService.create_notification(
            user=self.user_two,
            notification_type='withdraw',
            title='Withdraw successful',
            message='Your withdrawal of 1000 USD has been successfully processed.',
        )

        NotificationService.mark_all_as_read(user=self.user_one)

        notifications_all_read = NotificationService.get_notifications(
            user=self.user_one
        )

        self.assertEqual(notifications_all_read.first().is_read, True)

        notifications_not_read = NotificationService.get_notifications(
            user=self.user_two
        )

        self.assertEqual(notifications_not_read.first().is_read, False)

    def test_get_unread_count(self):
        NotificationService.create_notification(
            user=self.user_one,
            notification_type='deposit',
            title='Deposit successful',
            message='Your deposit of 100 USDT has been successfully'
                    ' added to your balance',
        )
        NotificationService.create_notification(
            user=self.user_one,
            notification_type='withdraw',
            title='Withdraw successful',
            message='Your withdrawal of 10 USD has been successfully processed.',
        )
        notification = NotificationService.create_notification(
            user=self.user_one,
            notification_type='withdraw',
            title='Withdraw successful',
            message='Your withdrawal of 1000 USD has been successfully processed.',
        )

        NotificationService.mark_as_read(
            user=self.user_one, notification_id=notification.id
        )

        notifications_count = NotificationService.get_unread_count(user=self.user_one)

        self.assertEqual(notifications_count, 2)


class NotificationApiTest(APITestCase):
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
            'first_name': 'Maxx',
            'last_name': 'Doede',
            'email': 'test12@gmail.com',
            'password': 'Test1234!',
        }

        self.user_one = self._register_and_confirm_user(self.first_user)
        self.user_two = self._register_and_confirm_user(self.second_user)

    def _register_and_confirm_user(self, data):
        response = AuthService.register(data)
        reg_id = response['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']
        user, _ = AuthService.confirm_register({'reg_id': reg_id, 'code': code})
        return user

    def _auth(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.cookies['access_token'] = str(refresh.access_token)

    def test_notifications_list_authenticated(self):
        self._auth(self.user_one)

        NotificationService.create_notification(
            user=self.user_one,
            notification_type='deposit',
            title='Deposit successful',
            message='Your deposit of 100 USDT has been successfully'
                    ' added to your balance',
        )
        NotificationService.create_notification(
            user=self.user_one,
            notification_type='withdraw',
            title='Withdraw successful',
            message='Your withdrawal of 10 USD has been successfully processed.',
        )

        response = self.client.get('/api/notifications/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['notifications']), 2)

    def test_notifications_list_unauthenticated(self):

        response = self.client.get('/api/notifications/')

        self.assertEqual(response.status_code, 401)

    def test_mark_as_read_api(self):
        self._auth(self.user_one)

        notification_id = NotificationService.create_notification(
            user=self.user_one,
            notification_type='deposit',
            title='Deposit successful',
            message='Your deposit of 100 USDT has been successfully'
                    ' added to your balance',
        )

        self.client.patch(f'/api/notifications/{notification_id.id}/read/')

        response = self.client.get('/api/notifications/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['notifications'][0]['is_read'], True)

    def test_mark_as_read_foreign_notification_api_returns_404(self):
        self._auth(self.user_two)

        notification_id = NotificationService.create_notification(
            user=self.user_one,
            notification_type='deposit',
            title='Deposit successful',
            message='Your deposit of 100 USDT has been successfully'
                    ' added to your balance',
        )

        response_read = self.client.patch(
            f'/api/notifications/{notification_id.id}/read/'
        )

        response = self.client.get('/api/notifications/')

        self.assertEqual(response_read.status_code, 404)
        self.assertEqual(len(response.data['notifications']), 0)

    def test_mark_all_as_read_api(self):
        self._auth(self.user_one)

        NotificationService.create_notification(
            user=self.user_one,
            notification_type='deposit',
            title='Deposit successful',
            message='Your deposit of 100 USDT has been successfully'
                    ' added to your balance',
        )
        NotificationService.create_notification(
            user=self.user_one,
            notification_type='withdraw',
            title='Withdraw successful',
            message='Your withdrawal of 10 USD has been successfully processed.',
        )

        response = self.client.patch('/api/notifications/read-all/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['updated_count'], 2)

    def test_unread_count_api(self):
        self._auth(self.user_one)

        NotificationService.create_notification(
            user=self.user_one,
            notification_type='deposit',
            title='Deposit successful',
            message='Your deposit of 100 USDT has been successfully'
                    ' added to your balance',
        )
        NotificationService.create_notification(
            user=self.user_one,
            notification_type='withdraw',
            title='Withdraw successful',
            message='Your withdrawal of 10 USD has been successfully processed.',
        )

        response = self.client.get('/api/notifications/unread-count/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['unread_count'], 2)


class NotificationIntegrationTest(TestCase):
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

        Wallet.objects.filter(user=self.user_one).update(balance=10000)

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
            current_price=10000,
            price_change_24h=0,
            volume_24h=0,
        )

    def _register_and_confirm_user(self, data):
        response = AuthService.register(data)
        reg_id = response['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']
        user, _ = AuthService.confirm_register({'reg_id': reg_id, 'code': code})
        return user

    def test_withdraw_creates_notification(self):
        WalletService.withdraw(self.user_one, 100, idempotency_key=None)

        notification = NotificationService.get_notifications(user=self.user_one)

        self.assertEqual(notification.count(), 1)
        self.assertEqual(notification.first().notification_type, 'withdraw')
        self.assertEqual(
            notification.first().message,
            'Your withdrawal of 100 USD has been successfully processed.',
        )
        self.assertEqual(notification.first().user, self.user_one)

    def test_buy_creates_notification(self):
        TradeService.buy(user=self.user_one, symbol='BTCUSDT', amount_usdt=5000)

        notification = NotificationService.get_notifications(user=self.user_one)

        self.assertEqual(notification.count(), 1)
        self.assertEqual(notification.first().notification_type, 'buy')
        self.assertEqual(
            notification.first().message, 'You bought 0.1 BTCUSDT for 5000 USD.'
        )
        self.assertEqual(notification.first().user, self.user_one)

    def test_sell_creates_notification(self):
        TradeService.buy(user=self.user_one, symbol='BTCUSDT', amount_usdt=5000)
        TradeService.sell(
            user=self.user_one, symbol='BTCUSDT', amount_crypto=Decimal(0.001)
        )

        notification = NotificationService.get_notifications(user=self.user_one)

        self.assertEqual(notification.count(), 2)
        self.assertEqual(notification.first().notification_type, 'sell')
        self.assertEqual(
            notification.first().message, 'You sold 0.001 BTCUSDT for 50.0 USD.'
        )
        self.assertEqual(notification.first().user, self.user_one)

    def test_exchange_creates_notification(self):
        TradeService.buy(user=self.user_one, symbol='BTCUSDT', amount_usdt=5000)
        TradeService.buy(user=self.user_one, symbol='ETHUSDT', amount_usdt=4000)

        TradeService.exchange(
            user=self.user_one,
            from_asset='BTCUSDT',
            to_asset='ETHUSDT',
            amount_crypto=Decimal(0.001),
        )

        notification = NotificationService.get_notifications(user=self.user_one)

        self.assertEqual(notification.count(), 3)
        self.assertEqual(notification.first().notification_type, 'exchange')
        self.assertEqual(
            notification.first().message,
            'You exchanged 0.001 BTCUSDT to 0.005 ETHUSDT.',
        )
        self.assertEqual(notification.first().user, self.user_one)
