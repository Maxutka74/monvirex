import time
from io import BytesIO
from unittest.mock import patch

from PIL import Image
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db.models import Model
from django.test import TestCase
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.test import APIClient

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
        response = AuthService.register(self.register_data)
        reg_id = response['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']
        return AuthService.confirm_register({'reg_id': reg_id, 'code': code})

    def _register_and_get_reset_id(self):
        result =  AuthService.reset_password({'email': self.register_data['email']})
        return result['reset_id']


    def test_register_success(self):
        response = AuthService.register(self.register_data)
        reg_id = response['reg_id']

        self.assertIsNotNone(reg_id)
        self.assertIsNotNone(cache.get(f'reg:{reg_id}'))

        self.mock_send_email.assert_called_once()

    def test_register_email_lock(self):
        first_result_reg_id = AuthService.register(self.register_data)
        self.assertIsNotNone(first_result_reg_id)

        second_result_reg_id = AuthService.register(self.register_data)
        self.assertEqual(second_result_reg_id['reg_id'], first_result_reg_id['reg_id'])

    def test_resend_register_code(self):
        response = AuthService.register(self.register_data)
        reg_id = response['reg_id']

        first_result_reg_id = AuthService.resend_register_code({'reg_id': reg_id})
        self.assertIsNotNone(first_result_reg_id)

        second_result_reg_id = AuthService.resend_register_code({'reg_id': reg_id})
        self.assertEqual(second_result_reg_id['reg_id'], first_result_reg_id['reg_id'])

    def test_resend_register_code_expired(self):
        with self.assertRaises(ValidationError) as e:
            AuthService.resend_register_code({'reg_id': '43t3g3ge-sdcd43t34-rf3342r4767-r784635'})

        self.assertIn('Code has expired', str(e.exception.detail))

    def test_confirm_register_success(self):
        result = AuthService.register(self.register_data)
        reg_id = result['reg_id']
        data_cache = cache.get(f'reg:{reg_id}')
        code = data_cache['code']

        user, refresh = AuthService.confirm_register({'reg_id': reg_id, 'code': code})

        self.assertIsNotNone(user.id)
        self.assertEqual(user.email, self.register_data['email'])
        self.assertIsNotNone(refresh)


    def test_confirm_register_wrong_code(self):
        response = AuthService.register(self.register_data)
        reg_id = response['reg_id']

        with self.assertRaises(ValidationError) as e:
            AuthService.confirm_register({'reg_id': reg_id, 'code': '000000'})

        self.assertIn('Code is not valid', str(e.exception.detail))


    def test_confirm_register_expired(self):
        response = AuthService.register(self.register_data)
        reg_id = response['reg_id']
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

        self.assertIn('Invalid credentials', str(e.exception.detail))


    def test_login_wrong_email(self):
        self._register_and_confirm_user()

        with self.assertRaises(ValidationError) as e:
            AuthService.login({
            'email': "test12@gmail.com",
            'password': "Test1234!"
        })

        self.assertIn('Invalid credentials', str(e.exception.detail))


    def test_reset_password_success(self):
        self._register_and_confirm_user()
        self.mock_send_email.reset_mock()

        response = AuthService.reset_password({
            'email': "test@gmail.com",
        })
        reset_id = response['reset_id']

        cached = cache.get(f'reset:{reset_id}')

        self.assertIsNotNone(cached)
        self.mock_send_email.assert_called_once()

    def test_reset_password_wrong_email(self):
        self._register_and_confirm_user()

        with self.assertRaises(ValidationError) as e:
            AuthService.reset_password({
            'email': "test12@gmail.com",
        })

        self.assertIn('Invalid request', str(e.exception.detail))

    def test_resend_password_code(self):
        self._register_and_confirm_user()

        response = AuthService.reset_password({
            'email': "test@gmail.com",
        })
        reset_id = response['reset_id']

        first_result_reset_id = AuthService.resend_password_code({'reset_id': reset_id})
        self.assertIsNotNone(first_result_reset_id)

        second_result_reset_id = AuthService.resend_password_code({'reset_id': reset_id})
        self.assertEqual(second_result_reset_id['reset_id'], first_result_reset_id['reset_id'])

    def test_resend_password_code_expired(self):
        with self.assertRaises(ValidationError) as e:
            AuthService.resend_password_code({'reset_id': '43t3g3ge-sdcd43t34-rf3342r4767-r784635'})

        self.assertIn('Code has expired', str(e.exception.detail))


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

    def test_refresh_token_success(self):
        user, refresh = self._register_and_confirm_user()

        new_token = AuthService.refresh_token(str(refresh))

        self.assertIsNotNone(new_token)
        self.assertIsNotNone(new_token.access_token)
        self.assertEqual(new_token['user_id'], user.id)

    def test_refresh_token_invalid(self):
        with self.assertRaises(ValidationError) as e:
            AuthService.refresh_token(str('43t3g3ge-sdcd43t34-rf3342r4767-r784635'))

        self.assertIn('Invalid refresh token', str(e.exception.detail))


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

        confirm_response = self.client.post('/api/auth/verify-email/', data={
        'reg_id': reg_id,
        'code': code
        })

        refresh = confirm_response.cookies['refresh_token'].value

        return refresh

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

    def test_resend_register(self):
        register_response = self.client.post('/api/auth/register/', data=self.register_data)

        first_response = self.client.post('/api/auth/resend-register-code/', data={'reg_id': register_response.data['reg_id']})

        self.assertEqual(first_response.status_code, status.HTTP_202_ACCEPTED)
        self.assertIn('reg_id', first_response.data)

        second_response = self.client.post('/api/auth/resend-register-code/', data={'reg_id': register_response.data['reg_id']})

        self.assertEqual(second_response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(second_response.data['reg_id'], first_response.data['reg_id'])

    def test_resend_register_invalid(self):
        response = self.client.post('/api/auth/resend-register-code/', data={'reg_id': '43t3g3ge-sdcd43t34-rf3342r4767-r784635'})

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

    def test_resend_password(self):
        self._register_and_confirm()

        reset_id = self.client.post('/api/auth/reset-password/', data={
            'email': self.register_data['email']
        })

        first_response = self.client.post('/api/auth/resend-password-code/', data={'reset_id': reset_id.data['reset_id']})

        self.assertEqual(first_response.status_code, status.HTTP_202_ACCEPTED)
        self.assertIn('reset_id', first_response.data)

        second_response = self.client.post('/api/auth/resend-password-code/', data={'reset_id': reset_id.data['reset_id']})

        self.assertEqual(second_response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(second_response.data['reset_id'], first_response.data['reset_id'])

    def test_resend_password_invalid(self):
        response = self.client.post('/api/auth/resend-password-code/', data={'reset_id': '43t3g3ge-sdcd43t34-rf3342r4767-r784635'})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

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

    def test_refresh_token(self):
        refresh = self._register_and_confirm()

        self.client.cookies['refresh_token'] = refresh

        response = self.client.post('/api/auth/refresh/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.cookies['refresh_token'])


    def test_refresh_token_invalid(self):
        refresh = str('43t3g3ge-sdcd43t34-rf3342r4767-r784635')

        self.client.cookies['refresh_token'] = refresh

        response = self.client.post('/api/auth/refresh/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


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
            'id': 12345,
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
        mock_telegram_auth.side_effect = ValidationError({'detail': 'Invalid credentials'})

        response = self.client.post('/api/auth/telegram-login/', data={
            'id': 12345,
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

class ProfileServiceApiTest(TestCase):

    def setUp(self):
        patched = patch('apps.auth_app.tasks.send_email.apply_async')
        self.mock_send_email = patched.start()
        self.addCleanup(patched.stop)

        self.client = APIClient()

        self.register_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'test@gmail.com',
            'password': 'Test1234!',
            'password_confirm': 'Test1234!'
        }

        self.user = self._register_and_confirm_user(self.register_data)

    def _create_valid_image(self):
        file = BytesIO()
        image = Image.new('RGB', (100, 100), color='red')
        image.save(file, 'JPEG')
        file.seek(0)

        return SimpleUploadedFile(
            name='avatar.jpg',
            content=file.read(),
            content_type='image/jpeg'
        )

    def _create_invalid_image(self):
        file = BytesIO()
        image = Image.new('RGB', (100, 100), color='red')
        image.save(file, 'GIF')
        file.seek(0)

        return SimpleUploadedFile(
            name='avatar.jpg',
            content=file.read(),
            content_type='image/gif'
        )

    def _register_and_confirm_user(self, register_data):
        response = AuthService.register(register_data)
        reg_id = response['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']
        user, _ = AuthService.confirm_register({'reg_id': reg_id, 'code': code})
        return user

    def _auth(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.cookies['access_token'] = str(refresh.access_token)

    def test_get_profile_success(self):
        self._auth()

        response = self.client.get('/api/auth/profile/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn( 'first_name', response.data[self.user.email])

    def test_get_profile_unauthorized(self):
        response = self.client.get('/api/auth/profile/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile_success(self):
        self._auth()

        response = self.client.patch('/api/auth/profile/', data={'first_name': 'Maxx', 'last_name': 'Volt'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[self.user.email]['first_name'], 'Maxx')
        self.assertEqual(response.data[self.user.email]['last_name'], 'Volt')

    def test_update_profile_empty_first_name(self):
        self._auth()

        response = self.client.patch('/api/auth/profile/', data={'first_name': '', 'last_name': 'Volt'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'][0], 'First name and last name cannot be empty')

    def test_update_profile_empty_last_name(self):
        self._auth()
        response = self.client.patch('/api/auth/profile/', data={'first_name': 'Maxx', 'last_name': ''}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'][0], 'First name and last name cannot be empty')

    def test_upload_avatar_success(self):
        self._auth()
        avatar = self._create_valid_image()

        response = self.client.patch('/api/auth/profile/avatar/', data={'avatar': avatar}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(self.user.avatar)
        self.assertIn('.webp', self.user.avatar.name)

    def test_upload_avatar_invalid_type(self):
        self._auth()
        avatar = self._create_invalid_image()

        response = self.client.patch('/api/auth/profile/avatar/', data={'avatar': avatar}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'][0], "Avatar type must be one of ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']")

    def test_delete_avatar_success(self):
        self._auth()
        avatar = self._create_valid_image()

        response = self.client.patch('/api/auth/profile/avatar/', data={'avatar': avatar}, format='multipart')

        self.user.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_delete_avatar = self.client.delete('/api/auth/profile/avatar/')

        self.user.refresh_from_db()

        self.assertEqual(response_delete_avatar.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(self.user.avatar)

    def test_change_password_success(self):
        self._auth()

        login_data = {
            'email': 'test@gmail.com',
            'password': 'Test2007'
        }

        change_password = {
            'old_password': 'Test1234!',
            'new_password': 'Test2007',
            'new_password_confirm': 'Test2007',
        }

        response = self.client.post('/api/auth/profile/change-password/', data=change_password, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Password changed successfully')

        response_login = self.client.post('/api/auth/login/', data=login_data, format='json')

        self.assertEqual(response_login.status_code, status.HTTP_200_OK)
        self.assertEqual(response_login.data['message'], 'Login successful')

    def test_change_password_wrong_old_password(self):
        self._auth()

        change_password = {
            'old_password': 'Test1234!4242',
            'new_password': 'Test2007',
            'new_password_confirm': 'Test2007',
        }

        response = self.client.post('/api/auth/profile/change-password/', data=change_password, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], 'Invalid credentials')

    def test_change_password_confirm_not_match(self):
        self._auth()

        change_password = {
            'old_password': 'Test1234!',
            'new_password': 'Test200711',
            'new_password_confirm': 'Test2007',
        }

        response = self.client.post('/api/auth/profile/change-password/', data=change_password, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'][0], 'Passwords do not match')

    def test_delete_profile_success(self):
        self._auth()

        response = self.client.post('/api/auth/profile/delete/', data={'password': 'Test1234!'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id=self.user.id).exists())

    def test_delete_profile_wrong_password(self):
        self._auth()

        response = self.client.post('/api/auth/profile/delete/', data={'password': 'Test1234252!'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(User.objects.filter(id=self.user.id).exists())
        self.assertEqual(response.data['detail'], 'Invalid credentials')