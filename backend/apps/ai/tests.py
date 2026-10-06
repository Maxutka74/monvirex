from unittest.mock import patch

from django.core.cache import cache
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.ai.exceptions import (
    GeminiRateLimitError,
    GeminiServiceError,
    GeminiTimeoutError,
)
from apps.ai.models import Chat
from apps.auth_app.services.auth_service import AuthService


class ChatsApiTest(APITestCase):
    def setUp(self):
        patches = patch('apps.auth_app.tasks.send_email.apply_async')
        self.mock_send_email = patches.start()
        self.addCleanup(patches.stop)

        self.user = {
            'first_name': 'Test',
            'last_name': 'User',
            'email': 'test@example.com',
            'password': 'TestUser123!'
        }

        self.second_user = {
            'first_name': 'Test1',
            'last_name': 'User2',
            'email': 'test123@example.com',
            'password': 'TestUser123!!!'
        }

        self.test_user = self._register_and_confirmation(self.user)
        self.second_test_user = self._register_and_confirmation(self.second_user)

        self.refresh = RefreshToken.for_user(self.test_user)
        self.second_refresh = RefreshToken.for_user(self.second_test_user)


    def _register_and_confirmation(self, data):
        response = AuthService.register(data)
        reg_id = response['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']
        user, _ = AuthService.confirm_register({'reg_id': reg_id, 'code': code})
        return user

    def test_chat_create_success(self):
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        response = self.client.post('/api/ai/chat/sendmessage/', data={
            'message': 'Hello',
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()['response'])

    def test_chat_get_all(self):
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        self.client.post('/api/ai/chat/sendmessage/', data={
            'message': 'Hello',
        })

        response = self.client.get('/api/ai/chat/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 1)

    def test_chat_continue_success(self):
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        self.client.post('/api/ai/chat/sendmessage/', data={
            'message': 'Hello',
        })

        chat = Chat.objects.get(user=self.test_user)

        response = self.client.post('/api/ai/chat/sendmessage/', data={
            'message': 'My name Maxx',
            'chat_id': chat.id
        })

        check_chats = self.client.get('/api/ai/chat/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()['response'])
        self.assertEqual(len(check_chats.json()), 1)


    def test_chat_get_detail(self):
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        self.client.post('/api/ai/chat/sendmessage/', data={
            'message': 'Hello',
        })

        chat = Chat.objects.get(user=self.test_user)

        response = self.client.get(f'/api/ai/chat/{chat.id}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['messages'][0]['role'], 'user')
        self.assertEqual(response.json()['messages'][1]['role'], 'assistant')

    def test_chat_not_found(self):
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        response = self.client.get('/api/ai/chat/999/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json(), 'Chat not found')


    def test_chat_unauthenticated(self):
        response = self.client.get('/api/ai/chat/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_chat(self):
        self.client.cookies['access_token'] = str(self.refresh.access_token)
        response = self.client.post('/api/ai/chat/create/')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()['title'], 'New Chat')

    def test_chat_create_unauthenticated(self):
        response = self.client.get('/api/ai/chat/create/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('apps.ai.views.ChatService.chat')
    def test_chat_rate_limit(self, mock_chat):
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        mock_chat.side_effect = GeminiRateLimitError()

        response = self.client.post('/api/ai/chat/sendmessage/', data={
            'message': 'Hello',
        })

        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    @patch('apps.ai.views.ChatService.chat')
    def test_chat_timeout(self, mock_chat):
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        mock_chat.side_effect = GeminiTimeoutError()

        response = self.client.post('/api/ai/chat/sendmessage/', data={
            'message': 'Hello',
        })

        self.assertEqual(response.status_code, status.HTTP_504_GATEWAY_TIMEOUT)

    @patch('apps.ai.views.ChatService.chat')
    def test_chat_service_error(self, mock_chat):
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        mock_chat.side_effect = GeminiServiceError()

        response = self.client.post('/api/ai/chat/sendmessage/', data={
               'message': 'Hello',
            })

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    def test_chat_delete(self):
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        self.client.post('/api/ai/chat/sendmessage/', data={
            'message': 'Hello',
        })

        chat = Chat.objects.get(user=self.test_user)


        response = self.client.delete(f'/api/ai/chat/{chat.id}/')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    def test_chat_delete_not_found(self):
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        response = self.client.delete('/api/ai/chat/999/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    def test_user_isolation(self):
        Chat.objects.create(
            user=self.test_user,
            title='Test',
        )

        self.client.cookies['access_token'] = str(self.second_refresh.access_token)

        chat = Chat.objects.get(user=self.test_user)

        response = self.client.get(f'/api/ai/chat/{chat.id}/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class MarketAnalizeApiTest(APITestCase):
    def setUp(self):
        patches = patch('apps.auth_app.tasks.send_email.apply_async')
        self.mock_send_email = patches.start()
        self.addCleanup(patches.stop)

        self.user = {
            'first_name': 'Test',
            'last_name': 'User',
            'email': 'test@example.com',
            'password': 'TestUser123!'
        }

        self.test_user = self._register_and_confirmation(self.user)

        self.refresh = RefreshToken.for_user(self.test_user)

    def _register_and_confirmation(self, data):
        response = AuthService.register(data)
        reg_id = response['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']
        user, _ = AuthService.confirm_register({'reg_id': reg_id, 'code': code})
        return user

    def test_market_analysis_success(self):
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        response = self.client.get('/api/ai/market-analysis/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json())

    def test_market_analysis_unauthenticated(self):
        response = self.client.get('/api/ai/market-analysis/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('apps.ai.views.MarketAnalysisService.market_analysis')
    def test_market_analysis_rate_limit(self, mock_market_analysis):
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        mock_market_analysis.side_effect = GeminiRateLimitError()

        response = self.client.get('/api/ai/market-analysis/')

        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    @patch('apps.ai.views.MarketAnalysisService.market_analysis')
    def test_market_analysis_throttle(self, mock_market_analysis):
        mock_market_analysis.return_value = 'test'
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        for _ in range(11):
            response = self.client.get('/api/ai/market-analysis/')

        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    @patch('apps.ai.views.MarketAnalysisService.market_analysis')
    def test_market_analysis_timeout(self, mock_market_analysis):
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        mock_market_analysis.side_effect = GeminiTimeoutError()

        response = self.client.get('/api/ai/market-analysis/')

        self.assertEqual(response.status_code, status.HTTP_504_GATEWAY_TIMEOUT)

    @patch('apps.ai.views.MarketAnalysisService.market_analysis')
    def test_market_analysis_service_error(self, mock_market_analysis):
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        mock_market_analysis.side_effect = GeminiServiceError()

        response = self.client.get('/api/ai/market-analysis/')

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

class PortfolioAnalizeApiTest(APITestCase):
    def setUp(self):
        patches = patch('apps.auth_app.tasks.send_email.apply_async')
        self.mock_send_email = patches.start()
        self.addCleanup(patches.stop)

        self.user = {
            'first_name': 'Test',
            'last_name': 'User',
            'email': 'test@example.com',
            'password': 'TestUser123!'
        }

        self.test_user = self._register_and_confirmation(self.user)

        self.refresh = RefreshToken.for_user(self.test_user)

    def _register_and_confirmation(self, data):
        response = AuthService.register(data)
        reg_id = response['reg_id']
        code = cache.get(f'reg:{reg_id}')['code']
        user, _ = AuthService.confirm_register({'reg_id': reg_id, 'code': code})
        return user

    def test_portfolio_analysis_success(self):
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        response = self.client.get('/api/ai/portfolio-analysis/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json())

    def test_portfolio_analysis_unauthenticated(self):
        response = self.client.get('/api/ai/portfolio-analysis/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('apps.ai.views.PortfolioAnalysisService.portfolio_analysis')
    def test_portfolio_analysis_rate_limit(self, mock_portfolio_analysis):
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        mock_portfolio_analysis.side_effect = GeminiRateLimitError()

        response = self.client.get('/api/ai/portfolio-analysis/')

        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    @patch('apps.ai.views.PortfolioAnalysisService.portfolio_analysis')
    def test_portfolio_analysis_throttle(self, mock_portfolio_analysis):
        mock_portfolio_analysis.return_value = 'test'
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        for _ in range(11):
            response = self.client.get('/api/ai/portfolio-analysis/')

        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    @patch('apps.ai.views.PortfolioAnalysisService.portfolio_analysis')
    def test_portfolio_analysis_timeout(self, mock_portfolio_analysis):
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        mock_portfolio_analysis.side_effect = GeminiTimeoutError()

        response = self.client.get('/api/ai/portfolio-analysis/')

        self.assertEqual(response.status_code, status.HTTP_504_GATEWAY_TIMEOUT)

    @patch('apps.ai.views.PortfolioAnalysisService.portfolio_analysis')
    def test_portfolio_analysis_service_error(self, mock_portfolio_analysis):
        self.client.cookies['access_token'] = str(self.refresh.access_token)

        mock_portfolio_analysis.side_effect = GeminiServiceError()

        response = self.client.get('/api/ai/portfolio-analysis/')

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)