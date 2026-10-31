from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    GoogleAuthView,
    ProfileView,
    ChangePasswordView,
    UserViewSet,
    CustomerViewSet,
    StaffCreateView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'customers', CustomerViewSet, basename='customer')

urlpatterns = [
    # Auth endpoints
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/google/', GoogleAuthView.as_view(), name='auth_google'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='auth_password_reset'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='auth_password_reset_confirm'),
    path('auth/staff/create/', StaffCreateView.as_view(), name='auth_staff_create'),

    # Accounts aliases matching frontend services
    path('accounts/login/', LoginView.as_view(), name='accounts_login'),
    path('accounts/register/', RegisterView.as_view(), name='accounts_register'),
    path('accounts/google/', GoogleAuthView.as_view(), name='accounts_google'),
    path('accounts/profile/', ProfileView.as_view(), name='accounts_profile'),
    path('accounts/change-password/', ChangePasswordView.as_view(), name='accounts_change_password'),
    path('accounts/password-reset/', PasswordResetRequestView.as_view(), name='accounts_password_reset'),
    path('accounts/token/refresh/', TokenRefreshView.as_view(), name='accounts_token_refresh'),
    path('accounts/staff/create/', StaffCreateView.as_view(), name='accounts_staff_create'),

    path('', include(router.urls)),
]
