from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ai.exceptions import (
    ChatNotFoundError,
    GeminiRateLimitError,
    GeminiServiceError,
    GeminiTimeoutError,
)
from apps.ai.serializers import ChatMessageSerializer, ChatSerializer
from apps.ai.services.chat_service import ChatService
from apps.ai.services.market_analysis_service import MarketAnalysisService
from apps.ai.services.portfolio_analysis_service import PortfolioAnalysisService
from config.throttles import (
    GeminiModelThrottle,
    MarketGeminiThrottle,
    PortfolioGeminiThrottle,
)

# Create your views here.

class ChatView(APIView):
    permission_classes = (IsAuthenticated,)
    throttle_classes = (GeminiModelThrottle, )

    def get(self, request):
        chats = ChatService.get_chats(request.user)

        serializer = ChatSerializer(chats, many=True)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    @extend_schema(request=ChatMessageSerializer)
    def post(self, request):

        message = ChatMessageSerializer(data=request.data)
        message.is_valid(raise_exception=True)

        try:
            chat=ChatService.chat(request.user,
                                  message.validated_data['message'],
                                  message.validated_data.get('chat_id', None)
                                  )

        except GeminiRateLimitError:
            return Response('Too Many Requests',
                            status=status.HTTP_429_TOO_MANY_REQUESTS
                            )
        except GeminiTimeoutError:
            return Response('Gateway Timeout',
                            status=status.HTTP_504_GATEWAY_TIMEOUT
                            )
        except ChatNotFoundError:
            return Response('Chat not found',
                            status=status.HTTP_404_NOT_FOUND
                            )
        except GeminiServiceError:
            return Response('Service Unavailable',
                            status=status.HTTP_503_SERVICE_UNAVAILABLE
                            )

        return Response({
            'response': chat
        }, status=status.HTTP_200_OK)

class ChatDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, chat_id):
        try:
            chat = ChatService.get_chat(request.user, chat_id)
        except ChatNotFoundError:
            return Response(
                'Chat not found',
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ChatSerializer(chat)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def delete(self, request, chat_id):
        try:
            ChatService.delete_chat(request.user, chat_id)
        except ChatNotFoundError:
            return Response(
                'Chat not found',
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(status=status.HTTP_204_NO_CONTENT)

class MarketAnalizeView(APIView):
    permission_classes = (IsAuthenticated,)
    throttle_classes = (MarketGeminiThrottle,)


    def get(self, request):

        try:
            market_analyze = MarketAnalysisService.market_analysis()
        except GeminiRateLimitError:
            return Response('Too Many Requests',
                            status=status.HTTP_429_TOO_MANY_REQUESTS
                            )
        except GeminiTimeoutError:
            return Response('Gateway Timeout',
                            status=status.HTTP_504_GATEWAY_TIMEOUT
                            )
        except GeminiServiceError:
            return Response('Service Unavailable',
                            status=status.HTTP_503_SERVICE_UNAVAILABLE
                            )

        return Response(
            market_analyze,
            status=status.HTTP_200_OK
        )


class PortfolioAnalizeView(APIView):
    permission_classes = (IsAuthenticated,)
    throttle_classes = (PortfolioGeminiThrottle,)

    def get(self, request):

        try:
            portfolio_analyze = (PortfolioAnalysisService.
                                 portfolio_analysis(request.user)
                                 )
        except GeminiRateLimitError:
            return Response('Too Many Requests',
                            status=status.HTTP_429_TOO_MANY_REQUESTS
                            )
        except GeminiTimeoutError:
            return Response('Gateway Timeout',
                            status=status.HTTP_504_GATEWAY_TIMEOUT
                            )
        except GeminiServiceError:
            return Response('Service Unavailable',
                            status=status.HTTP_503_SERVICE_UNAVAILABLE
                            )

        return Response(
            portfolio_analyze,
            status=status.HTTP_200_OK
        )
