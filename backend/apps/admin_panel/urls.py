from django.urls import path

from apps.admin_panel.views import (
    AdminStatsView,
    AdminSyncAssetView,
    AdminUserCryptoTransactionsAllView,
    AdminUserDetailView,
    AdminUserListView,
    AdminUserToggleActiveView,
    AdminUserTransactionsAllView,
)

urlpatterns = [
    path('users/', AdminUserListView.as_view(), name='users'),
    path('users/<int:user_id>/', AdminUserDetailView.as_view(), name='user'),
    path(
        'users/<int:user_id>/toggle-active/',
        AdminUserToggleActiveView.as_view(),
        name='user-toggle_active',
    ),
    path(
        'transactions/',
        AdminUserTransactionsAllView.as_view(),
        name='users-transactions',
    ),
    path(
        'crypto-transactions/',
        AdminUserCryptoTransactionsAllView.as_view(),
        name='user-crypto-transactions',
    ),
    path('assets/sync/', AdminSyncAssetView.as_view(), name='asset-sync'),
    path('stats/', AdminStatsView.as_view(), name='stats'),
]
