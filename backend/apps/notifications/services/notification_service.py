import logging

from apps.notifications.models import Notification

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    def create_notification(user, notification_type, title, message):
        logger.info(
            "Creating notification user_id=%s type=%s title=%s",
            user.id,
            notification_type,
            title,
        )

        notification = Notification.objects.create(
            user=user, notification_type=notification_type, title=title, message=message
        )

        logger.info(
            "Notification created successfully notification_id=%s user_id=%s type=%s",
            notification.id,
            user.id,
            notification_type,
        )

        return notification

    @staticmethod
    def get_notifications(user):
        notifications = Notification.objects.filter(user=user)
        return notifications

    @staticmethod
    def mark_as_read(user, notification_id):
        logger.info(
            "Mark notification as read requested user_id=%s notification_id=%s",
            user.id,
            notification_id,
        )

        try:
            notification = Notification.objects.get(user=user, id=notification_id)
        except Notification.DoesNotExist:
            logger.warning(
                "Notification not found user_id=%s notification_id=%s",
                user.id,
                notification_id,
            )

            return None

        notification.is_read = True
        notification.save()

        logger.info(
            "Notification marked as read notification_id=%s user_id=%s",
            notification.id,
            user.id,
        )

        return notification

    @staticmethod
    def mark_all_as_read(user):
        logger.info("Mark all notifications as read requested user_id=%s", user.id)

        notifications = Notification.objects.filter(user=user, is_read=False)
        count = notifications.count()
        notifications.update(is_read=True)

        logger.info(
            "All notifications marked as read user_id=%s count=%s",
            user.id,
            count,
        )

        return count

    @staticmethod
    def get_unread_count(user):
        notifications = Notification.objects.filter(user=user, is_read=False)
        return notifications.count()
