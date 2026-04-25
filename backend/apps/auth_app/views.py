from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.auth_app.serializers import RegisterSerializer, LoginSerializer, ConfirmRegisterSerializer, \
    ResetPasswordSerializer, ConfirmResetPasswordSerializer, ChangePasswordSerializer, GoogleLoginSerializer, \
    TelegramLoginSerializer
from apps.auth_app.services.auth_service import AuthService
from apps.auth_app.utils.cookies import set_auth_cookies, delete_auth_cookies
from apps.auth_app.services.oauth_service import GoogleAuthService, TelegramAuthService


# Create your views here.
class RegisterView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=RegisterSerializer)
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reg_id = AuthService.register(serializer.validated_data)

        if reg_id is None:
            return Response({
                "message": "You can request a code once every two minutes"
            }, status=status.HTTP_400_BAD_REQUEST)

        response = Response({
            "message": f"Verification code sent to your email",
            "reg_id": reg_id
        }, status=status.HTTP_202_ACCEPTED)
        return response


class ConfirmRegisterView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=ConfirmRegisterSerializer)
    def post(self, request):
        serializer = ConfirmRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, resfresh = AuthService.confirm_register(data=serializer.validated_data)

        response = Response({
            "message": "User created successfully",
            "data": {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email
            }
        }, status=status.HTTP_201_CREATED)

        return set_auth_cookies(response, resfresh)



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

class GoogleLoginView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=GoogleLoginSerializer)
    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, refresh = GoogleAuthService.google_auth(serializer.validated_data)

        response = Response({
            'message': 'User authenticated successfully',
        }, status=status.HTTP_200_OK)

        return set_auth_cookies(response,refresh)

class TelegramLoginView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=TelegramLoginSerializer)
    def post(self, request):
        serializer = TelegramLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, resfresh = TelegramAuthService.telegram_auth(serializer.validated_data)

        response = Response({
            'message': 'User authenticated successfully',
        }, status=status.HTTP_200_OK)

        return set_auth_cookies(response,resfresh)


class ResetPasswordView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=ResetPasswordSerializer)
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_id = AuthService.reset_password(serializer.validated_data)

        if reset_id is None:
            return Response({
                "message": "You can request a code once every two minutes"
            }, status=status.HTTP_400_BAD_REQUEST)

        response = Response({
            "message": "Reset password code sent to your email",
            "reset_id": reset_id
        }, status=status.HTTP_202_ACCEPTED)

        return response

class ConfirmResetPasswordView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=ConfirmResetPasswordSerializer)
    def post(self, request):
        serializer = ConfirmResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_verify_id = AuthService.confirm_reset_password(serializer.validated_data)

        response = Response({
            'message': 'Reset code confirmed',
            'reset_verify_id': reset_verify_id
        })

        return response

class ChangePasswordView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=ChangePasswordSerializer)
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AuthService.change_password(serializer.validated_data)

        response = Response({
            "message": "Password changed successfully",
        }, status=status.HTTP_200_OK)

        return response

class LogoutView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        response = Response({
            "message": "Logout successful"
        }, status=status.HTTP_204_NO_CONTENT)

        return delete_auth_cookies(response)