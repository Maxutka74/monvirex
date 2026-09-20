from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class RegisterThrottle(AnonRateThrottle):
    scope = 'register'

class ResendCodeThrottle(AnonRateThrottle):
    scope = 'resend_code'

class LoginThrottle(AnonRateThrottle):
    scope = 'login'

class ResetPasswordThrottle(AnonRateThrottle):
    scope = 'reset_password'

class TradeThrottle(UserRateThrottle):
    scope = 'trade'

class DepositThrottle(UserRateThrottle):
    scope = 'deposit'

class GeminiModelThrottle(UserRateThrottle):
    scope = 'gemini_model'

class MarketGeminiThrottle(UserRateThrottle):
    scope = 'market_gemini'

class PortfolioGeminiThrottle(UserRateThrottle):
    scope = 'portfolio_gemini'