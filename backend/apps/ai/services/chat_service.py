from django.db import transaction

from apps.ai.exceptions import ChatNotFoundError
from apps.ai.models import Chat, ChatMessage
from apps.ai.services.gemini_service import GeminiService


class ChatService:

    @staticmethod
    def get_chats(user):
        return Chat.objects.prefetch_related('messages').filter(user=user).order_by('-updated_at')

    @staticmethod
    def get_chat(user, chat_id):
        chat = Chat.objects.filter(user=user).filter(id=chat_id).first()

        if chat is None:
            raise ChatNotFoundError()

        return chat

    @staticmethod
    def create_chat(user):
        chat = Chat.objects.create(
            user=user,
            title='New Chat'
        )

        return chat

    @staticmethod
    def delete_chat(user, chat_id):
        chat = Chat.objects.filter(user=user).filter(id=chat_id).first()

        if chat is None:
            raise ChatNotFoundError()

        chat.delete()


    @staticmethod
    def chat(user, message, chat_id):
        if chat_id is None:
            chat = Chat.objects.create(user=user, title=message)
        else:
            chat = Chat.objects.filter(user=user).filter(id=chat_id).first()

        if chat is None:
            raise ChatNotFoundError()

        if chat.title == 'New Chat':
            chat.title = message
            chat.save()

        messages = ChatMessage.objects.filter(chat=chat).order_by('-created_at')[:8]

        messages = list(messages)

        messages.reverse()

        response = GeminiService().generate_response(message, messages)

        with transaction.atomic():
            ChatMessage.objects.create(chat=chat, role='user', content=message)

            ChatMessage.objects.create(chat=chat, role='assistant', content=response)

        return response