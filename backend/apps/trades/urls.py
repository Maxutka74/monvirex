from django.urls import path

from apps.trades.views import BuyView, SellView, ExchangeView

urlpatterns = [
    path('buy/', BuyView.as_view(), name='buy'),
    path('sell/', SellView.as_view(), name='sell'),
    path('exchange/', ExchangeView.as_view(), name='exchange'),
]