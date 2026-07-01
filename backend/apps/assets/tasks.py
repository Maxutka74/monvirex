import logging

from celery import shared_task

from apps.assets.service.binance.service import AssetService

logger = logging.getLogger(__name__)

@shared_task
def sync_assets_task():
    logger.info("Celery task sync_assets_task started")

    service = AssetService()
    result = service.sync_assets()

    logger.info("Celery task sync_assets_task finished successfully")

    return result


@shared_task
def update_price_task():
    logger.info("Celery task update_price_task started")

    service = AssetService()
    result = service.update_prices()

    logger.info("Celery task update_price_task finished successfully")

    return result
