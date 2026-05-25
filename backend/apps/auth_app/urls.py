from django.urls import path
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView

from apps.auth_app.views import RegisterView, ConfirmRegisterView, LoginView, ResetPasswordView, LogoutView, \
    ConfirmResetPasswordView, ChangePasswordView, GoogleLoginView, TelegramLoginView, ResendRegisterCodeView, \
    ResendPasswordCodeView, RefreshTokenView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('resend-register-code/', ResendRegisterCodeView.as_view(), name='resend_register_code'),
    path('verify-email/', ConfirmRegisterView.as_view(),name='confirm_register'),
    path('login/', LoginView.as_view(), name='login'),
    path('google-login/', GoogleLoginView.as_view(), name='google_login'),
    path('telegram-login/', TelegramLoginView.as_view(), name='telegram_login'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('resend-password-code/', ResendPasswordCodeView.as_view(), name='resend_register_code'),
    path('verify-reset-password/', ConfirmResetPasswordView.as_view(), name='confirm_reset_password'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh'),
]