from apps.notifications.models import Notification


class NotificationService:
    @staticmethod
    def create_notification(user, notification_type, title, message):
        notification = Notification.objects.create(
            user=user, notification_type=notification_type, title=title, message=message
        )
        return notification

    @staticmethod
    def get_notifications(user):
        notifications = Notification.objects.filter(user=user)
        return notifications

    @staticmethod
    def mark_as_read(user, notification_id):
        try:
            notification = Notification.objects.get(user=user, id=notification_id)
        except Notification.DoesNotExist:
            return None
        notification.is_read = True
        notification.save()
        return notification

    @staticmethod
    def mark_all_as_read(user):
        notifications = Notification.objects.filter(user=user, is_read=False)
        count = notifications.count()
        notifications.update(is_read=True)
        return count

    @staticmethod
    def get_unread_count(user):
        notifications = Notification.objects.filter(user=user, is_read=False)
        return notifications.count()
