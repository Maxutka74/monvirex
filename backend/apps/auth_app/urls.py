from django.urls import path

from apps.auth_app.views import RegisterView, ConfirmRegisterView, LoginView, ResetPasswordView, LogoutView, \
    ConfirmResetPasswordView, ChangePasswordView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-email/', ConfirmRegisterView.as_view(),name='confirm_register'),
    path('login/', LoginView.as_view(), name='login'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('verify-reset-password/', ConfirmResetPasswordView.as_view(), name='confirm_reset_password'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('logout/', LogoutView.as_view(), name='logout'),
]