def set_auth_cookies(response, refresh):
    response.set_cookie(
        key='access_token',
        value=str(refresh.access_token),
        httponly=True,
        secure=False,
        samesite='Lax',
        max_age=300
    )

    response.set_cookie(
        key='refresh_token',
        value=str(refresh),
        httponly=True,
        secure=False,
        samesite='Lax',
        max_age=7 * 24 * 3600
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