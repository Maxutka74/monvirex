from rest_framework.exceptions import ValidationError

VALID_INTERVALS = {
    "1m","3m","5m","15m","30m",
    "1h","2h","4h","6h","8h","12h",
    "1d","3d","1w","1M"
}


def validate_symbol(symbol: str):
    if not symbol:
        raise ValidationError({'details': 'Symbol is required'})

    if not symbol.isalnum():
        raise ValidationError({'details': 'Invalid symbol'})

    return symbol.upper()

def validate_interval(interval: str):
    interval = interval.strip()

    if interval not in VALID_INTERVALS:
        raise ValidationError({'details': 'Invalid interval'})

    return interval