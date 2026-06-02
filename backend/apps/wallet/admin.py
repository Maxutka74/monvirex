from django.contrib import admin

from apps.wallet.models import Wallet, Transaction


# Register your models here.

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'balance', 'created_at', 'updated_at')
    search_fields = ('user__email', 'user__telegram_id')
    list_filter = ('created_at', 'updated_at')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'transaction_type', 'amount', 'status', 'stripe_session_id', 'created_at')
    search_fields = ('id', 'stripe_session_id', 'user__email', 'user__telegram_id', 'idempotency_key')
    list_filter = ('transaction_type', 'status', 'created_at')
    readonly_fields = ('id', 'created_at', 'stripe_session_id')
    list_per_page = 20
    ordering = ('-created_at',)