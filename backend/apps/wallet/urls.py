from django.urls import path

from apps.wallet.views import (
    ActivitySummaryView,
    CryptoTransactionView,
    PortfolioHistoryView,
    PortfolioView,
    StripeWebhookView,
    TransactionHistoryView,
    WalletBalanceView,
    WalletDepositView,
    WalletWithdrawView,
)

urlpatterns = [
    path('balance/', WalletBalanceView.as_view(), name='balance'),
    path('transactions/', TransactionHistoryView.as_view(), name='transaction'),
    path('deposit/', WalletDepositView.as_view(), name='deposit'),
    path('stripe/webhook/', StripeWebhookView.as_view(), name='stripe_webhook'),
    path('withdraw/', WalletWithdrawView.as_view(), name='withdraw'),
    path('portfolio/', PortfolioView.as_view(), name='portfolio'),
    path('portfolio/history/', PortfolioHistoryView.as_view(),
         name='portfolio_snapshots'),
    path('activity-summary/', ActivitySummaryView.as_view(), name='activity_summary'),
    path(
        'crypto_transactions/',
        CryptoTransactionView.as_view(),
        name='crypto_transactions',
    ),
]
