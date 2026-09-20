from rest_framework import serializers

from apps.ai.models import Chat, ChatMessage


class ChatMessageSerializer(serializers.Serializer):
    message = serializers.CharField(required=True, min_length=1, max_length=1000)
    chat_id = serializers.IntegerField(required=False, allow_null=True)

class ChatMessageModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'

class ChatSerializer(serializers.ModelSerializer):
    messages = ChatMessageModelSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = ('id', 'title', 'created_at', 'updated_at', 'messages')
