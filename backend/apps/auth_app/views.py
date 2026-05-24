
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.auth_app.serializers import RegisterSerializer, LoginSerializer, ConfirmRegisterSerializer, \
    ResetPasswordSerializer, ConfirmResetPasswordSerializer, ChangePasswordSerializer, GoogleLoginSerializer, \
    TelegramLoginSerializer, ResendRegisterSerializer, ResendPasswordSerializer
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
        reset_data = AuthService.register(serializer.validated_data)

        response = Response({
            "message": f"Verification code sent to your email",
            "reg_id": reset_data['reg_id'],
            "email": reset_data['email'],
            "expires_at": reset_data['expires_at']

        }, status=status.HTTP_202_ACCEPTED)
        return response

class ResendRegisterCodeView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=ResendRegisterSerializer)
    def post(self, request):
        serializer = ResendRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_data = AuthService.resend_register_code(serializer.validated_data)

        response = Response({
            "message": f"Verification code sent to your email",
            "reg_id": reset_data['reg_id'],
            "email": reset_data['email'],
            "expires_at": reset_data['expires_at']

        }, status=status.HTTP_202_ACCEPTED)
        return response


class ConfirmRegisterView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=ConfirmRegisterSerializer)
    def post(self, request):
        serializer = ConfirmRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, refresh = AuthService.confirm_register(data=serializer.validated_data)

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

        remembre_me = serializer.validated_data['remember_me']

        response = Response({
            "message": "Login successful"
        }, status=status.HTTP_200_OK)

        return set_auth_cookies(response, refresh, remembre_me)

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

        return set_auth_cookies(response,refresh, remember_me=True)

class TelegramLoginView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=TelegramLoginSerializer)
    def post(self, request):
        serializer = TelegramLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, refresh = TelegramAuthService.telegram_auth(serializer.validated_data)

        response = Response({
            'message': 'User authenticated successfully',
        }, status=status.HTTP_200_OK)

        return set_auth_cookies(response,refresh, remember_me=True)


class ResetPasswordView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=ResetPasswordSerializer)
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_data = AuthService.reset_password(serializer.validated_data)

        response = Response({
            "message": "Reset password code sent to your email",
            "reset_id": reset_data['reset_id'],
            'email': reset_data['email'],
            'expires_at': reset_data['expires_at']
        }, status=status.HTTP_202_ACCEPTED)

        return response

class ResendPasswordCodeView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=ResendPasswordSerializer)
    def post(self, request):
        serializer = ResendPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_data = AuthService.resend_password_code(serializer.validated_data)

        response = Response({
            "message": "Reset password code sent to your email",
            "reset_id": reset_data['reset_id'],
            'email': reset_data['email'],
            'expires_at': reset_data['expires_at']
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
        }, status=status.HTTP_200_OK)

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
        response = Response(status=status.HTTP_204_NO_CONTENT)

        return delete_auth_cookies(response)