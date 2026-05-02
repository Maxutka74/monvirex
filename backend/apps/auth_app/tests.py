import time
from unittest.mock import patch

from django.core.cache import cache
from django.test import TestCase
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.auth_app.services.auth_service import AuthService
from apps.auth_app.models import User


# Create your tests here.
class AuthServiceTest(TestCase):

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

    def tearDown(self):
        cache.clear()

    def _register_and_confirm_user(self):
        reg_id = AuthService.register(self.register_data)
        code = cache.get(f'reg:{reg_id}')['code']
        return AuthService.confirm_register({'reg_id': reg_id, 'code': code})

    def _register_and_get_reset_id(self):
        return AuthService.reset_password({'email': self.register_data['email']})


    def test_register_success(self):
        reg_id = AuthService.register(self.register_data)

        self.assertIsNotNone(reg_id)
        self.assertIsNotNone(cache.get(f'reg:{reg_id}'))

        self.mock_send_email.assert_called_once()

    def test_register_email_lock(self):
        first_result_reg_id = AuthService.register(self.register_data)
        self.assertIsNotNone(first_result_reg_id)

        second_result_reg_id = AuthService.register(self.register_data)
        self.assertIsNone(second_result_reg_id)


    def test_confirm_register_success(self):
        reg_id = AuthService.register(self.register_data)
        data_cache = cache.get(f'reg:{reg_id}')
        code = data_cache['code']

        user, refresh = AuthService.confirm_register({'reg_id': reg_id, 'code': code})

        self.assertIsNotNone(user.id)
        self.assertEqual(user.email, self.register_data['email'])
        self.assertIsNotNone(refresh)


    def test_confirm_register_wrong_code(self):
        reg_id = AuthService.register(self.register_data)

        with self.assertRaises(ValidationError) as e:
            AuthService.confirm_register({'reg_id': reg_id, 'code': '000000'})

        self.assertIn('Code is not valid', str(e.exception.detail))


    def test_confirm_register_expired(self):
        reg_id = AuthService.register(self.register_data)
        code = cache.get(f'reg:{reg_id}')['code']

        with self.assertRaises(ValidationError) as e:
            AuthService.confirm_register({'reg_id': '43t3g3ge-sdcd43t34-rf3342r4767-r784635', 'code': code})
        self.assertIn('Code has expired', str(e.exception.detail))


    def test_login_success(self):
        self._register_and_confirm_user()

        user, refresh = AuthService.login({
            'email': "test@gmail.com",
            'password': "Test1234!"
        })

        self.assertIsNotNone(user.id)
        self.assertEqual(user.email, "test@gmail.com",)
        self.assertIsNotNone(refresh)


    def test_login_wrong_password(self):
        self._register_and_confirm_user()

        with self.assertRaises(ValidationError) as e:
            AuthService.login({
            'email': "test@gmail.com",
            'password': "Test123456!"
        })

        self.assertIn('Email or Password is incorrect', str(e.exception.detail))


    def test_login_wrong_email(self):
        self._register_and_confirm_user()

        with self.assertRaises(ValidationError) as e:
            AuthService.login({
            'email': "test12@gmail.com",
            'password': "Test1234!"
        })

        self.assertIn('Email or Password is incorrect', str(e.exception.detail))


    def test_reset_password_success(self):
        self._register_and_confirm_user()
        self.mock_send_email.reset_mock()

        reset_id = AuthService.reset_password({
            'email': "test@gmail.com",
        })
        cached = cache.get(f'reset:{reset_id}')

        self.assertIsNotNone(reset_id)
        self.assertIsNotNone(cached)
        self.mock_send_email.assert_called_once()

    def test_reset_password_wrong_email(self):
        self._register_and_confirm_user()

        with self.assertRaises(ValidationError) as e:
            AuthService.reset_password({
            'email': "test12@gmail.com",
        })

        self.assertIn('Invalid request', str(e.exception.detail))


    def test_confirm_reset_password_success(self):
        self._register_and_confirm_user()
        reset_id = self._register_and_get_reset_id()
        code = cache.get(f'reset:{reset_id}')['code']

        res = AuthService.confirm_reset_password({'reset_id': reset_id, 'code': code})

        self.assertIsNotNone(res)


    def test_confirm_reset_password_wrong_code(self):
        self._register_and_confirm_user()
        reset_id = self._register_and_get_reset_id()

        with self.assertRaises(ValidationError) as e:
            AuthService.confirm_reset_password({'reset_id': reset_id, 'code': '000000'})

        self.assertIn('Code is not valid', str(e.exception.detail))


    def test_change_password_success(self):
        self._register_and_confirm_user()
        reset_id = self._register_and_get_reset_id()
        code = cache.get(f'reset:{reset_id}')['code']

        reset_verify_id = AuthService.confirm_reset_password({'reset_id': reset_id, 'code': code})

        res = AuthService.change_password({
            'reset_verify_id': reset_verify_id,
            'password': "Monvirex12"
        })
        self.assertIsNone(res)


class AuthServiceApiTest(TestCase):

    def setUp(self):
        patched = patch('apps.auth_app.tasks.send_email.apply_async')
        self.mock_send_email = patched.start()
        self.addCleanup(patched.stop)

        self.register_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'test@gmail.com',
            'password': 'Test1234!',
            'password_confirm': 'Test1234!'
        }

    def tearDown(self):
        cache.clear()

    def _register_and_confirm(self):
        register_response = self.client.post('/api/auth/register/', data=self.register_data)

        reg_id = register_response.data['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']

        self.client.post('/api/auth/verify-email/', data={
        'reg_id': reg_id,
        'code': code
        })

    def _reset_and_verify_reset_id(self):
        reset_id = self.client.post('/api/auth/reset-password/', data={
            'email': 'test@gmail.com'
        })

        reset_code = cache.get(f'reset:{reset_id.data['reset_id']}')['code']

        reset_verify_id = self.client.post('/api/auth/verify-reset-password/', data={
            'reset_id': reset_id.data['reset_id'],
            'code': reset_code
        })

        return reset_verify_id


    def test_register_api(self):
        response = self.client.post('/api/auth/register/', data=self.register_data)

        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)

        self.assertIn('reg_id', response.data)
        self.assertIn('message', response.data)

        self.assertIsInstance(response.data['reg_id'], str)

        reg_id = response.data['reg_id']
        cached = cache.get(f'reg:{reg_id}')
        self.assertIsNotNone(cached)

        self.mock_send_email.assert_called_once()

    def test_register_api_invalid(self):
        data = {}

        response = self.client.post('/api/auth/register/', data=data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_confirm_register_api(self):
        register_response = self.client.post('/api/auth/register/', data=self.register_data)

        reg_id = register_response.data['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']

        confirm_response = self.client.post('/api/auth/verify-email/', data={
        'reg_id': reg_id,
        'code': code
        })

        self.assertEqual(confirm_response.status_code, status.HTTP_201_CREATED)

        self.assertTrue(User.objects.filter(email='test@gmail.com').exists())

        self.assertIn('data', confirm_response.data)
        self.assertEqual(confirm_response.data['data']['email'], 'test@gmail.com')

        self.assertIn('refresh_token', confirm_response.cookies)

        self.assertIsNone(cache.get(f'reg:{reg_id}'))

    def test_confirm_register_code_invalid(self):
        register_response = self.client.post('/api/auth/register/', data=self.register_data)

        reg_id = register_response.data['reg_id']

        confirm_response = self.client.post('/api/auth/verify-email/', data={
            'reg_id': reg_id,
            'code': '000000'
        })

        self.assertEqual(confirm_response.status_code, status.HTTP_400_BAD_REQUEST)


    def test_confirm_register_cache_invalid(self):
        register_response = self.client.post('/api/auth/register/', data=self.register_data)

        reg_id = register_response.data['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']

        confirm_response = self.client.post('/api/auth/verify-email/', data={
            'reg_id': '1313432',
            'code': code
        })

        self.assertEqual(confirm_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_api(self):
        self._register_and_confirm()

        login_response = self.client.post('/api/auth/login/', data={
            'email': self.register_data['email'],
            'password': 'Test1234!'
        })

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        self.assertIn('refresh_token', login_response.cookies)


    def test_login_api_invalid(self):
        self._register_and_confirm()

        login_response = self.client.post('/api/auth/login/', data={
            'email': 'test12@gmail.com',
            'password': 'Test1234!'
        })

        self.assertEqual(login_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password(self):
        self._register_and_confirm()
        self.mock_send_email.reset_mock()

        reset_id = self.client.post('/api/auth/reset-password/', data={
            'email': self.register_data['email']
        })

        self.assertEqual(reset_id.status_code, status.HTTP_202_ACCEPTED)
        self.assertIn('reset_id', reset_id.data)
        self.assertIsInstance(reset_id.data['reset_id'], str)
        self.assertIsNotNone(cache.get(f'reset:{reset_id.data['reset_id']}'))

        self.mock_send_email.assert_called_once()

    def test_reset_password_invalid(self):
        self._register_and_confirm()

        reset_id = self.client.post('/api/auth/reset-password/', data={
            'email': 'test12@gmail.com'
        })

        self.assertEqual(reset_id.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_confirm(self):
        self._register_and_confirm()
        reset_verify_id = self._reset_and_verify_reset_id()

        self.assertEqual(reset_verify_id.status_code, status.HTTP_200_OK)
        self.assertIn('reset_verify_id', reset_verify_id.data)
        self.assertIsInstance(reset_verify_id.data['reset_verify_id'], str)


    def test_reset_password_confirm_invalid(self):
        self._register_and_confirm()

        reset_id = self.client.post('/api/auth/reset-password/', data={
            'email': self.register_data['email']
        })

        reset_code = cache.get(f'reset:{reset_id.data['reset_id']}')['code']

        reset_verify_id = self.client.post('/api/auth/verify-reset-password/', data={
            'reset_id': reset_code,
            'code': '000000'
        })

        self.assertEqual(reset_verify_id.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password(self):
        self._register_and_confirm()
        reset_verify_id = self._reset_and_verify_reset_id()

        verify_code = self.client.post('/api/auth/change-password/', data={
            'reset_verify_id': reset_verify_id.data['reset_verify_id'],
            'password': 'Yuliy2007!',
            'password_confirm': 'Yuliy2007!'
        })

        self.assertEqual(verify_code.status_code, status.HTTP_200_OK)

    def test_change_password_invalid(self):
        self._register_and_confirm()
        reset_verify_id = self._reset_and_verify_reset_id()

        verify_code = self.client.post('/api/auth/change-password/', data={
            'reset_verify_id': reset_verify_id.data['reset_verify_id'],
            'password': 'Yuliy2007!',
            'password_confirm': 'Yuliy2007'
        })

        self.assertEqual(verify_code.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_change_password(self):
        self._register_and_confirm()
        reset_verify_id = self._reset_and_verify_reset_id()

        self.client.post('/api/auth/change-password/', data={
            'reset_verify_id': reset_verify_id.data['reset_verify_id'],
            'password': 'Yuliy2007!',
            'password_confirm': 'Yuliy2007!'
        })

        login_response = self.client.post('/api/auth/login/', data={
            'email': 'test@gmail.com',
            'password': 'Yuliy2007!'
        })

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        self.assertIn('refresh_token', login_response.cookies)

    def test_login_change_password_invalid(self):
        self._register_and_confirm()
        reset_verify_id = self._reset_and_verify_reset_id()

        self.client.post('/api/auth/change-password/', data={
            'reset_verify_id': reset_verify_id.data['reset_verify_id'],
            'password': 'Yuliy2007!',
            'password_confirm': 'Yuliy2007!'
        })

        login_response = self.client.post('/api/auth/login/', data={
            'email': 'test@gmail.com',
            'password': 'Yuliy2007'
        })

        self.assertEqual(login_response.status_code, status.HTTP_400_BAD_REQUEST)

class OAuthTest(TestCase):

    @patch('apps.auth_app.services.oauth_service.GoogleAuthService.google_auth')
    def test_google_auth(self, mock_google_auth):
        user = User.objects.create(email='test@gmail.com')
        refresh = RefreshToken.for_user(user=user)

        mock_google_auth.return_value = (user, refresh)

        response = self.client.post('/api/auth/google-login/', data={
            'token': 'fake_token'
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.cookies)
        self.assertIn('refresh_token', response.cookies)

        mock_google_auth.assert_called_once()

    @patch('apps.auth_app.services.oauth_service.GoogleAuthService.google_auth')
    def test_google_auth_invalid(self, mock_google_auth):
        mock_google_auth.side_effect = ValidationError({'detail': 'Invalid credentials'})

        response = self.client.post('/api/auth/google-login/', data={
            'token': 'bad_token'
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)

        self.assertNotIn('access_token', response.cookies)
        self.assertNotIn('refresh_token', response.cookies)

        mock_google_auth.assert_called_once()

    @patch('apps.auth_app.services.oauth_service.TelegramAuthService.telegram_auth')
    def test_telegram_auth(self, mock_telegram_auth):
        user = User.objects.create(email='test@gmail.com')
        refresh = RefreshToken.for_user(user=user)

        mock_telegram_auth.return_value = (user, refresh)

        response = self.client.post('/api/auth/telegram-login/', data={
            'telegram_id': 12345,
            'first_name': 'John',
            'last_name': 'Doe',
            'auth_date': int(time.time()),
            'hash': 'valid_hash'
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.cookies)
        self.assertIn('refresh_token', response.cookies)

        mock_telegram_auth.assert_called_once()

    @patch('apps.auth_app.services.oauth_service.TelegramAuthService.telegram_auth')
    def test_telegram_auth_invalid(self, mock_telegram_auth):
        mock_telegram_auth.side_effect = ValidationError({'detail': 'Invalid hash'})

        response = self.client.post('/api/auth/telegram-login/', data={
            'telegram_id': 12345,
            'first_name': 'John',
            'last_name': 'Doe',
            'auth_date': 1710000000,
            'hash': 'invalid_hash'
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn('detail', response.data)

        self.assertNotIn('access_token', response.cookies)
        self.assertNotIn('refresh_token', response.cookies)

        mock_telegram_auth.assert_called_once()