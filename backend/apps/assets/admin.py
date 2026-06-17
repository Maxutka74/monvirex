from django.contrib import admin
from django.utils.html import format_html

from assets.models import Asset


# Register your models here.
@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('symbol', 'name', 'icon_preview', 'current_price', 'price_change_24h', 'volume_24h', 'is_active', 'updated_at')
    list_filter = ('is_active', 'updated_at')
    search_fields = ('symbol', 'name')
    readonly_fields = ('current_price', 'price_change_24h', 'volume_24h', 'updated_at')
    list_editable = ('name', 'is_active')
    list_per_page = 50
    ordering = ('-volume_24h',)
    def icon_preview(self, obj):
        return format_html('<img src="{}" width="24" height="24" />', obj.icon_url)
    icon_preview.short_description = 'Icon'