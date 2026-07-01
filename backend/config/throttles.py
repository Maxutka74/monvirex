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