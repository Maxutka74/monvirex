from django.urls import path

from apps.assets.views import (
    AssetDetailView,
    AssetKlinesView,
    AssetListView,
    TopMoversView,
)

urlpatterns = [
    path('assets/', AssetListView.as_view(), name='assets'),
    path('assets/top-movers/', TopMoversView.as_view(), name='top-movers'),
    path(
        'assets/klines/<str:symbol>/<str:interval>/<int:limit>/',
        AssetKlinesView.as_view(),
        name='asset-klines',
    ),
    path('assets/<str:symbol>/', AssetDetailView.as_view(), name='asset-detail'),
]
