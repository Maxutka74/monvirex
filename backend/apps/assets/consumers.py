import logging

from channels.generic.websocket import AsyncWebsocketConsumer

from apps.assets.service.binance.validators import validate_interval, validate_symbol
from apps.assets.stream_manager import StreamManager

manager = StreamManager()
logger = logging.getLogger(__name__)

class KlineConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.symbol = validate_symbol(self.scope['url_route']['kwargs']['symbol'])
        self.interval = validate_interval(self.scope['url_route']['kwargs']['interval'])

        await self.accept()

        logger.info(
            "WebSocket kline connection accepted symbol=%s interval=%s",
            self.symbol,
            self.interval,
        )

        manager.add(self.symbol, self.interval, self.send)


        logger.info(
            "WebSocket kline stream subscribed symbol=%s interval=%s",
            self.symbol,
            self.interval,
        )

        await self.send(text_data='connected')

    async def disconnect(self, close_code):
        logger.info(
            "WebSocket kline disconnected symbol=%s interval=%s close_code=%s",
            self.symbol,
            self.interval,
            close_code,
        )

        manager.remove(self.symbol, self.interval, self.send)
