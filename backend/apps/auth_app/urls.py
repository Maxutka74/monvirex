from django.urls import path

from apps.auth_app.views import RegisterView, ConfirmRegisterView, LoginView, LogoutView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-email/', ConfirmRegisterView.as_view(),name='confirm_register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]