from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.auth_app.serializers import (
    ChangePasswordSerializer,
    ConfirmRegisterSerializer,
    ConfirmResetPasswordSerializer,
    GoogleLoginSerializer,
    LoginSerializer,
    ProfileAvatarSerializer,
    ProfileChangePasswordSerializer,
    ProfileChangeUsernameSerializer,
    ProfileDeleteSerializer,
    ProfileSerializer,
    RegisterSerializer,
    ResendPasswordSerializer,
    ResendRegisterSerializer,
    ResetPasswordSerializer,
    TelegramLoginSerializer,
)
from apps.auth_app.services.auth_service import AuthService
from apps.auth_app.services.oauth_service import GoogleAuthService, TelegramAuthService
from apps.auth_app.services.profile_service import ProfileService
from apps.auth_app.utils.cookies import delete_auth_cookies, set_auth_cookies
from config.throttles import (
    LoginThrottle,
    RegisterThrottle,
    ResendCodeThrottle,
    ResetPasswordThrottle,
)


# Create your views here.
class CheckAuthMe(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        current_user = request.user

        response = Response({
            'id': current_user.id,
            'email': current_user.email,
            'first_name': current_user.first_name,
            'last_name': current_user.last_name,
            'is_staff': current_user.is_staff,
            'is_superuser': current_user.is_superuser
        })

        return response

class RegisterView(APIView):
    permission_classes = (AllowAny,)
    throttle_classes = [RegisterThrottle]

    @extend_schema(request=RegisterSerializer)
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_data = AuthService.register(serializer.validated_data)

        response = Response(
            {
                'message': 'Verification code sent to your email',
                'reg_id': reset_data['reg_id'],
                'email': reset_data['email'],
                'expires_at': reset_data['expires_at'],
            },
            status=status.HTTP_202_ACCEPTED,
        )
        return response


class ResendRegisterCodeView(APIView):
    permission_classes = (AllowAny,)
    throttle_classes = [ResendCodeThrottle]

    @extend_schema(request=ResendRegisterSerializer)
    def post(self, request):
        serializer = ResendRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_data = AuthService.resend_register_code(serializer.validated_data)

        response = Response(
            {
                'message': 'Verification code sent to your email',
                'reg_id': reset_data['reg_id'],
                'email': reset_data['email'],
                'expires_at': reset_data['expires_at'],
            },
            status=status.HTTP_202_ACCEPTED,
        )
        return response


class ConfirmRegisterView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=ConfirmRegisterSerializer)
    def post(self, request):
        serializer = ConfirmRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, refresh = AuthService.confirm_register(data=serializer.validated_data)

        response = Response(
            {
                'message': 'User created successfully',
                'data': {
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                },
            },
            status=status.HTTP_201_CREATED,
        )

        return set_auth_cookies(response, refresh)


class LoginView(APIView):
    permission_classes = (AllowAny,)
    throttle_classes = [LoginThrottle]

    @extend_schema(request=LoginSerializer)
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, refresh = AuthService.login(serializer.validated_data)

        remembre_me = serializer.validated_data['remember_me']

        response = Response({'message': 'Login successful'}, status=status.HTTP_200_OK)

        return set_auth_cookies(response, refresh, remembre_me)


class GoogleLoginView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=GoogleLoginSerializer)
    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, refresh = GoogleAuthService.google_auth(serializer.validated_data)

        response = Response(
            {
                'message': 'User authenticated successfully',
            },
            status=status.HTTP_200_OK,
        )

        return set_auth_cookies(response, refresh, remember_me=True)


class TelegramLoginView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=TelegramLoginSerializer)
    def post(self, request):
        serializer = TelegramLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, refresh = TelegramAuthService.telegram_auth(serializer.validated_data)

        response = Response(
            {
                'message': 'User authenticated successfully',
            },
            status=status.HTTP_200_OK,
        )

        return set_auth_cookies(response, refresh, remember_me=True)


class ResetPasswordView(APIView):
    permission_classes = (AllowAny,)
    throttle_classes = [ResetPasswordThrottle]

    @extend_schema(request=ResetPasswordSerializer)
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_data = AuthService.reset_password(serializer.validated_data)

        response = Response(
            {
                'message': 'Reset password code sent to your email',
                'reset_id': reset_data['reset_id'],
                'email': reset_data['email'],
                'expires_at': reset_data['expires_at'],
            },
            status=status.HTTP_202_ACCEPTED,
        )

        return response


class ResendPasswordCodeView(APIView):
    permission_classes = (AllowAny,)
    throttle_classes = [ResendCodeThrottle]

    @extend_schema(request=ResendPasswordSerializer)
    def post(self, request):
        serializer = ResendPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_data = AuthService.resend_password_code(serializer.validated_data)

        response = Response(
            {
                'message': 'Reset password code sent to your email',
                'reset_id': reset_data['reset_id'],
                'email': reset_data['email'],
                'expires_at': reset_data['expires_at'],
            },
            status=status.HTTP_202_ACCEPTED,
        )

        return response


class ConfirmResetPasswordView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=ConfirmResetPasswordSerializer)
    def post(self, request):
        serializer = ConfirmResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_verify_id = AuthService.confirm_reset_password(serializer.validated_data)

        response = Response(
            {'message': 'Reset code confirmed', 'reset_verify_id': reset_verify_id},
            status=status.HTTP_200_OK,
        )

        return response


class ChangePasswordView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=ChangePasswordSerializer)
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AuthService.change_password(serializer.validated_data)

        response = Response(
            {
                'message': 'Password changed successfully',
            },
            status=status.HTTP_200_OK,
        )

        return response


class ProfileView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(request=ProfileSerializer)
    def get(self, request):
        profile = ProfileService.get_profile(user=request.user)
        serializer = ProfileSerializer(profile)

        response = Response(
            {
                request.user.email: {
                    'first_name': serializer.data['first_name'],
                    'last_name': serializer.data['last_name'],
                    'avatar': request.user.avatar_url,
                }
            },
            status=status.HTTP_200_OK,
        )

        return response

    @extend_schema(request=ProfileChangeUsernameSerializer)
    def patch(self, request):
        serializer = ProfileChangeUsernameSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        first_name, last_name = ProfileService.patch_profile(
            user=request.user,
            first_name=serializer.validated_data['first_name'],
            last_name=serializer.validated_data['last_name'],
        )

        response = Response(
            {
                'message': 'Change your data successfully',
                request.user.email: {'first_name': first_name, 'last_name': last_name},
            },
            status=status.HTTP_200_OK,
        )

        return response


class ProfileDeleteView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(request=ProfileDeleteSerializer)
    def post(self, request):
        serializer = ProfileDeleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ProfileService.delete_profile(
            user=request.user, password=serializer.validated_data['password']
        )

        response = Response({}, status=status.HTTP_204_NO_CONTENT)

        return response


class PortfolioAvatarView(APIView):
    permission_classes = (IsAuthenticated,)
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(request=ProfileAvatarSerializer)
    def patch(self, request):
        serializer = ProfileAvatarSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        avatar = ProfileService.patch_profile_avatar(
            user=request.user, avatar=serializer.validated_data['avatar']
        )

        response = Response(
            {'message': 'Portfolio avatar updated successfully', 'avatar': avatar},
            status=status.HTTP_200_OK,
        )

        return response

    def delete(self, request):
        ProfileService.delete_profile_avatar(user=request.user)

        response = Response({}, status=status.HTTP_204_NO_CONTENT)

        return response


class PortfolioChangePasswordView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(request=ProfileChangePasswordSerializer)
    def post(self, request):
        serializer = ProfileChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ProfileService.post_change_password(
            user=request.user,
            old_password=serializer.validated_data['old_password'],
            new_password=serializer.validated_data['new_password'],
        )

        response = Response(
            {
                'message': 'Password changed successfully',
            },
            status=status.HTTP_200_OK,
        )

        return response


class LogoutView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        response = Response(status=status.HTTP_204_NO_CONTENT)

        return delete_auth_cookies(response)


class RefreshTokenView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        try:
            refresh_token_new = AuthService.refresh_token(refresh_token)
        except ValidationError:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        response = Response(
            {'message': 'Reset token successfully'}, status=status.HTTP_200_OK
        )

        return set_auth_cookies(response, refresh_token_new)
