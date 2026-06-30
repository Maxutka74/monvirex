from django.urls import path

from apps.notifications.views import (
    NotificationListView,
    NotificationMarkAllAsReadView,
    NotificationMarkAsReadView,
    NotificationUnreadCountView,
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path(
        '<uuid:notification_id>/read/',
        NotificationMarkAsReadView.as_view(),
        name='notification-mark-as-read',
    ),
    path(
        'read-all/',
        NotificationMarkAllAsReadView.as_view(),
        name='notification-mark-all-as-read',
    ),
    path(
        'unread-count/',
        NotificationUnreadCountView.as_view(),
        name='notification-unread-count',
    ),
]
