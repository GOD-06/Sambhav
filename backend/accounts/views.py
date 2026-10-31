from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    UserCreateSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from .permissions import IsAdmin, IsStaffUser, IsOwnerOrStaff

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Customer self-registration endpoint."""
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        return Response({
            'user': UserSerializer(user).data,
            'access': access_token,
            'refresh': refresh_token,
            'tokens': {
                'refresh': refresh_token,
                'access': access_token,
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """User login endpoint that returns JWT tokens."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )

        if user is None:
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {'detail': 'Account is disabled.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        return Response({
            'user': UserSerializer(user).data,
            'access': access_token,
            'refresh': refresh_token,
            'tokens': {
                'refresh': refresh_token,
                'access': access_token,
            }
        })


class ProfileView(APIView):
    """Current authenticated user profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordView(APIView):
    """Change password for authenticated user."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not request.user.check_password(old_password):
            return Response({'old_password': ['Current password is incorrect.']}, status=status.HTTP_400_BAD_REQUEST)

        if not new_password or len(new_password) < 8:
            return Response({'new_password': ['Password must be at least 8 characters.']}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_password)
        request.user.save()
        return Response({'detail': 'Password changed successfully.'})


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users.
    - Admin can list all users.
    - Staff can list customers.
    - Customer can only see themselves.
    """
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ('create', 'destroy'):
            return [IsAdmin()]
        if self.action in ('list',):
            return [IsStaffUser()]
        return [IsOwnerOrStaff()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return User.objects.none()
        if user.role == 'admin':
            return User.objects.all()
        elif user.role == 'staff':
            return User.objects.filter(role='customer')
        return User.objects.filter(pk=user.pk)

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        if request.method == 'GET':
            return Response(UserSerializer(request.user).data)
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class CustomerViewSet(viewsets.ModelViewSet):
    """Dedicated viewset for customer management."""
    serializer_class = UserSerializer
    permission_classes = [IsStaffUser]

    def get_queryset(self):
        return User.objects.filter(role='customer')

    def perform_create(self, serializer):
        serializer.save(role='customer')


class StaffCreateView(generics.CreateAPIView):
    """Admin-only endpoint to create staff users."""
    serializer_class = UserCreateSerializer
    permission_classes = [IsAdmin]

    def perform_create(self, serializer):
        serializer.save(role='staff')


class PasswordResetRequestView(APIView):
    """Request a password reset email (console backend for dev)."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'detail': 'If an account with this email exists, a reset link has been sent.'},
                status=status.HTTP_200_OK,
            )

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"http://localhost:5173/reset-password/{uid}/{token}/"

        send_mail(
            subject='Brightloop - Password Reset Request',
            message=f'Use this link to reset your password: {reset_url}',
            from_email='noreply@brightloop.com',
            recipient_list=[email],
            fail_silently=False,
        )

        return Response(
            {'detail': 'If an account with this email exists, a reset link has been sent.'},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """Confirm a password reset with token and new password."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token_data = serializer.validated_data['token']

        try:
            parts = token_data.split('/')
            uid = force_str(urlsafe_base64_decode(parts[0]))
            token = parts[1]
            user = User.objects.get(pk=uid)
        except (ValueError, IndexError, User.DoesNotExist):
            return Response(
                {'detail': 'Invalid reset token.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {'detail': 'Invalid or expired reset token.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response(
            {'detail': 'Password has been reset successfully.'},
            status=status.HTTP_200_OK,
        )
