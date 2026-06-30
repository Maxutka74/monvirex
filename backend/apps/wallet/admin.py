from django.contrib import admin

from apps.wallet.models import CryptoTransaction, CryptoWallet, Transaction, Wallet

# Register your models here.


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'balance', 'created_at', 'updated_at')
    search_fields = ('user__email', 'user__telegram_id')
    list_filter = ('created_at', 'updated_at')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'transaction_type',
        'amount',
        'status',
        'stripe_session_id',
        'created_at',
    )
    search_fields = (
        'id',
        'stripe_session_id',
        'user__email',
        'user__telegram_id',
        'idempotency_key',
    )
    list_filter = ('transaction_type', 'status', 'created_at')
    readonly_fields = ('id', 'created_at', 'stripe_session_id')
    list_per_page = 20
    ordering = ('-created_at',)


@admin.register(CryptoWallet)
class CryptoWalletAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'asset',
        'amount',
        'average_buy_price',
        'current_value',
        'profit_loss',
        'updated_at',
    )
    list_filter = ('asset', 'updated_at')
    search_fields = ('user__email', 'user__telegram_id', 'asset_symbol')
    readonly_fields = ('id', 'current_value', 'profit_loss', 'created_at', 'updated_at')
    ordering = ('-updated_at',)


@admin.register(CryptoTransaction)
class CryptoTransactionAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'asset',
        'transaction_type',
        'crypto_amount',
        'usdt_amount',
        'status',
        'created_at',
    )
    list_filter = ('asset', 'transaction_type', 'status', 'created_at')
    search_fields = ('user__email', 'user__telegram_id', 'asset')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)
