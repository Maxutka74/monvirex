from rest_framework.response import Response
from rest_framework.views import APIView

from apps.admin_panel.pagination import AdminPagination
from apps.admin_panel.permissions import IsAdminUser
from apps.admin_panel.serializers import (
    AdminAssetToggleActiveSerializer,
    AdminStatsSerializer,
    AdminUserCryptoTransactionAllSerializer,
    AdminUserDetailSerializer,
    AdminUserListSerializer,
    AdminUserToggleActiveSerializer,
    AdminUserTransactionAllSerializer,
)
from apps.admin_panel.services.admin_services import AdminPanelServices


# Create your views here.
class AdminUserListView(APIView):
    permission_classes = (IsAdminUser,)
    pagination_classes = AdminPagination

    def get(self, request):
        search = request.query_params.get('search')
        is_active = request.query_params.get('is_active')

        users = AdminPanelServices.get_users(search, bool(is_active))

        paginator = self.pagination_classes()
        page = paginator.paginate_queryset(users, request, view=self)

        serializer = AdminUserListSerializer(page, many=True)

        return paginator.get_paginated_response(data=serializer.data)


class AdminUserDetailView(APIView):
    permission_classes = (IsAdminUser,)

    def get(self, request, user_id):
        data = AdminPanelServices.get_user_detail(user_id)

        serializer = AdminUserDetailSerializer(data)

        return Response(serializer.data)


class AdminUserToggleActiveView(APIView):
    permission_classes = (IsAdminUser,)

    def patch(self, request, user_id):
        data = AdminPanelServices.toggle_user_active(user_id)

        serializer = AdminUserToggleActiveSerializer(data)

        return Response(serializer.data)


class AdminUserTransactionsAllView(APIView):
    permission_classes = (IsAdminUser,)
    pagination_classes = AdminPagination

    def get(self, request):
        data = AdminPanelServices.transaction_user_all()

        paginator = self.pagination_classes()
        page = paginator.paginate_queryset(data, request, view=self)

        serializer = AdminUserTransactionAllSerializer(page, many=True)

        return paginator.get_paginated_response(serializer.data)


class AdminUserCryptoTransactionsAllView(APIView):
    permission_classes = (IsAdminUser,)
    pagination_classes = AdminPagination

    def get(self, request):
        data = AdminPanelServices.crypto_transaction_user_all()

        paginator = self.pagination_classes()
        page = paginator.paginate_queryset(data, request, view=self)

        serializer = AdminUserCryptoTransactionAllSerializer(page, many=True)

        return paginator.get_paginated_response(serializer.data)


class AdminAssetToggleActiveView(APIView):
    permission_classes = (IsAdminUser,)

    def patch(self, request, symbol):
        data = AdminPanelServices.toggle_asset_active(symbol)

        serializer = AdminAssetToggleActiveSerializer(data)

        return Response(serializer.data)


class AdminSyncAssetView(APIView):
    permission_classes = (IsAdminUser,)

    def post(self, request):
        data = AdminPanelServices.sync_asset()

        return Response(data)


class AdminStatsView(APIView):
    permission_classes = (IsAdminUser,)

    def get(self, request):
        data = AdminPanelServices.get_platform_stats()

        serializer = AdminStatsSerializer(data)

        return Response(serializer.data)
