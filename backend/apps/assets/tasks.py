from celery import shared_task

from apps.assets.service.binance.service import AssetService

@shared_task
def sync_assets_task():
    service = AssetService()
    return service.sync_assets()

@shared_task
def update_price_task():
    service = AssetService()
    return service.update_prices()
