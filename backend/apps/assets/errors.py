import httpx
from rest_framework.exceptions import APIException


class BinanceAPIError(APIException):
    def __init__(self, message: str):
        super().__init__({"detail": message})


class ErrorHandler:
    @staticmethod
    def handle_httpx_error(exc: Exception):
        if isinstance(exc, httpx.TimeoutException):
            raise BinanceAPIError("Binance timeout")

        if isinstance(exc, httpx.HTTPStatusError):
            raise BinanceAPIError("Invalid Binance response")

        if isinstance(exc, httpx.RequestError):
            raise BinanceAPIError("Binance connection error")

        raise BinanceAPIError("Unknown Binance error")