from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    message = 'You do not have admin permission'

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff
