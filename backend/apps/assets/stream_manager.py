import asyncio
import json
import logging
from collections import defaultdict

import websockets

logger = logging.getLogger(__name__)

class StreamManager:
    def __init__(self):
        self.subscribers = defaultdict(set)
        self.tasks = {}

    def _key(self, symbol: str, interval: str):
        return f'{symbol}:{interval}'

    def add(self, symbol: str, interval: str, send):
        key = self._key(symbol, interval)
        self.subscribers[key].add(send)

        logger.info(
            "WebSocket subscriber added key=%s subscribers_count=%s",
            key,
            len(self.subscribers[key]),
        )

        if key not in self.tasks:
            logger.info("Starting Binance stream task key=%s", key)
            self.tasks[key] = asyncio.create_task(self._run(symbol, interval))

    def remove(self, symbol: str, interval: str, send):
        key = self._key(symbol, interval)

        if key in self.subscribers:
            self.subscribers[key].discard(send)

            logger.info(
                "WebSocket subscriber removed key=%s subscribers_count=%s",
                key,
                len(self.subscribers[key]),
            )

            if not self.subscribers[key]:
                self._stop(symbol, interval)

    def _stop(self, symbol: str, interval: str):
        key = self._key(symbol, interval)
        task = self.tasks.get(key)

        if task:
            logger.info("Stopping Binance stream task key=%s", key)
            task.cancel()

        self.tasks.pop(key, None)
        self.subscribers.pop(key, None)

        logger.info("Binance stream task stopped key=%s", key)

    async def _run(self, symbol: str, interval: str):
        key = self._key(symbol, interval)
        url = f'wss://stream.binance.com:9443/ws/{symbol.lower()}@kline_{interval.lower()}'

        logger.info("Binance stream started key=%s", key)

        while True:
            try:
                async with websockets.connect(url) as wb:
                    logger.info("Connected to Binance WebSocket stream key=%s", key)

                    while True:
                        resp = json.loads(await wb.recv())
                        k = resp['k']

                        data = {
                            'type': 'kline',
                            'data': {
                                'time': k['t'] // 1000,
                                'open': k['o'],
                                'high': k['h'],
                                'low': k['l'],
                                'close': k['c'],
                                'volume': k['v'],
                            },
                        }

                        deads = []

                        for send in self.subscribers[key]:
                            try:
                                await send(text_data=json.dumps(data))
                            except Exception:
                                logger.warning(
                                    "Dead WebSocket subscriber detected key=%s",
                                    key,
                                )
                                deads.append(send)

                        for dead in deads:
                            self.subscribers[key].discard(dead)

            except Exception:
                logger.exception(
                    "Binance WebSocket stream error key=%s, reconnecting in 2 seconds",
                    key,
                )
                await asyncio.sleep(2)
