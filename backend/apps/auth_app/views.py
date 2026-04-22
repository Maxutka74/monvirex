from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.auth_app.serializers import RegisterSerializer, LoginSerializer
from apps.auth_app.services.auth_service import AuthService
from apps.auth_app.utils.cookies import set_auth_cookies, delete_auth_cookies


# Create your views here.
class RegisterView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=RegisterSerializer)
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, refresh = AuthService.register(serializer.validated_data)
        response = Response({
            "message": "User created successfully",
            "data": {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email
            }
        }, status=status.HTTP_201_CREATED)

        return set_auth_cookies(response, refresh)

class LoginView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=LoginSerializer)
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, refresh = AuthService.login(serializer.validated_data)

        response = Response({
            "message": "Login successful"
        }, status=status.HTTP_200_OK)

        return set_auth_cookies(response, refresh)

class LogoutView(APIView):
    permission_classes = (AllowAny,)

    extend_schema(request=LoginSerializer)
    def post(self, request):
        response = Response({
            "message": "Logout successful"
        }, status=status.HTTP_204_NO_CONTENT)

        return delete_auth_cookies(response)