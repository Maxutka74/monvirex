import httpx


def icon_exists(url :str) -> bool:
    try:
        r = httpx.head(url, timeout=5)
        return r.status_code == 200
    except Exception:
        return False