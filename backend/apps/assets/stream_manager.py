import asyncio
from collections import defaultdict

import websockets
import json

class StreamManager:
    def __init__(self):
        self.subscribers = defaultdict(set)
        self.tasks = {}

    def _key(self, symbol: str, interval: str):
        return f"{symbol}:{interval}"

    def add(self, symbol: str, interval: str, send):
        key = self._key(symbol, interval)
        self.subscribers[key].add(send)

        if key not in self.tasks:
            self.tasks[key] = asyncio.create_task(
                self._run(symbol, interval)
            )

    def remove(self, symbol: str, interval: str, send):
        key = self._key(symbol, interval)

        if key in self.subscribers:
            self.subscribers[key].discard(send)

            if not self.subscribers[key]:
                self._stop(symbol, interval)

    def _stop(self, symbol: str, interval: str):
        key = self._key(symbol, interval)
        task = self.tasks.get(key)

        if task:
            task.cancel()

        self.tasks.pop(key, None)
        self.subscribers.pop(key, None)

    async def _run(self, symbol: str, interval: str):
        key = self._key(symbol, interval)
        url = f"wss://stream.binance.com:9443/ws/{symbol.lower()}@kline_{interval.lower()}"

        while True:
            try:
                async with websockets.connect(url) as wb:
                    while True:
                        resp = json.loads(await wb.recv())
                        k = resp["k"]

                        data = {
                            "type": "kline",
                            "data": {
                                "time": k["t"] // 1000,
                                "open": k["o"],
                                "high": k["h"],
                                "low": k["l"],
                                "close": k["c"],
                                "volume": k["v"],
                            }
                        }

                        deads = []

                        for send in self.subscribers[key]:
                            try:
                                await send(text_data=json.dumps(data))
                            except:
                                deads.append(send)

                        for dead in deads:
                            self.subscribers[key].discard(dead)
            except Exception:
                await asyncio.sleep(2)
