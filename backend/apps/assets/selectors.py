import logging

from rest_framework.exceptions import ValidationError

from django.db.models.functions import Abs

from apps.assets.models import Asset

logger = logging.getLogger(__name__)

class AssetSelector:
    @staticmethod
    def get_assets():
        return Asset.objects.filter(is_active=True)

    @staticmethod
    def get_asset(symbol: str):
        return Asset.objects.filter(symbol=symbol, is_active=True).first()

    @staticmethod
    def get_top_movers(limit: int):
        logger.info('Getting top movers with limit %s', limit)

        try:
            limit = int(limit)
        except (TypeError, ValueError):
            logger.warning('Invalid top movers limit: %s', limit)
            raise ValidationError('Limit must be an integer')

        if limit < 1:
            logger.warning('Invalid top movers limit: %s', limit)
            raise ValidationError("Limit must be greater than 0")

        if limit > 20:
            logger.info('Top movers limit capped from %s to 20', limit)
            limit = 20

        assets = (
            Asset.objects
            .filter(is_active=True)
            .exclude(price_change_24h=0)
            .annotate(abs_change=Abs('price_change_24h'))
            .order_by('-abs_change')[:limit]
        )

        logger.info('Top movers fetched: count=%s', len(assets))

        return assets