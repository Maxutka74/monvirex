from django.urls import re_path
from apps.assets.consumers import KlineConsumer

websocket_urlpatterns = [
    re_path(
        r"ws/klines/(?P<symbol>[^/]+)/(?P<interval>[^/]+)/$",
        KlineConsumer.as_asgi()
    ),
]