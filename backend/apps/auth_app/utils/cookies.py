from django.conf import settings


def set_auth_cookies(response, refresh, remember_me = False):
    refresh_max_age = 30 * 24 * 3600 if remember_me else 7 * 24 * 3600

    response.set_cookie(
        key='access_token',
        value=str(refresh.access_token),
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite='Lax',
        max_age=300
    )

    response.set_cookie(
        key='refresh_token',
        value=str(refresh),
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite='Lax',
        max_age=refresh_max_age
    )

    return response

def delete_auth_cookies(response):
    response.delete_cookie(
        key='access_token',
    )

    response.delete_cookie(
        key='refresh_token',
    )

    return response