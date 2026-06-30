from channels.generic.websocket import AsyncWebsocketConsumer

from apps.assets.service.binance.validators import validate_interval, validate_symbol
from apps.assets.stream_manager import StreamManager

manager = StreamManager()


class KlineConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.symbol = validate_symbol(self.scope['url_route']['kwargs']['symbol'])
        self.interval = validate_interval(self.scope['url_route']['kwargs']['interval'])

        await self.accept()

        manager.add(self.symbol, self.interval, self.send)

        await self.send(text_data='connected')

    async def disconnect(self, close_code):
        manager.remove(self.symbol, self.interval, self.send)
