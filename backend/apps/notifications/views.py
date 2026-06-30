from django.http import Http404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notifications.pagination import NotificationPagination
from apps.notifications.serializer import NotificationSerializer
from apps.notifications.services.notification_service import NotificationService


# Create your views here.
class NotificationListView(APIView):
    permission_classes = (IsAuthenticated,)
    pagination_class = NotificationPagination

    def get(self, request):
        notifications = NotificationService.get_notifications(user=request.user)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(notifications, request, view=self)

        serializer = NotificationSerializer(page, many=True)

        return paginator.get_paginated_response(serializer.data)


class NotificationMarkAsReadView(APIView):
    permission_classes = (IsAuthenticated,)

    def patch(self, request, notification_id):
        notification = NotificationService.mark_as_read(
            user=request.user, notification_id=notification_id
        )

        if not notification:
            raise Http404('Notification not found')

        response = Response(
            {
                'message': 'Message read',
            },
            status=status.HTTP_200_OK,
        )

        return response


class NotificationMarkAllAsReadView(APIView):
    permission_classes = (IsAuthenticated,)

    def patch(self, request):
        notification_count = NotificationService.mark_all_as_read(user=request.user)

        response = Response(
            {
                'message': 'All read',
                'updated_count': notification_count,
            },
            status=status.HTTP_200_OK,
        )

        return response


class NotificationUnreadCountView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        notifications_count = NotificationService.get_unread_count(user=request.user)

        response = Response(
            {
                'unread_count': notifications_count,
            },
            status=status.HTTP_200_OK,
        )

        return response
