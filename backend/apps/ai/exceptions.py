

class GeminiServiceError(Exception):
    pass

class GeminiRateLimitError(GeminiServiceError):
    pass

class GeminiTimeoutError(GeminiServiceError):
    pass

class ChatNotFoundError(Exception):
    pass