from rest_framework import viewsets, status
from rest_framework.response import Response
from accounts.permissions import IsStaffUser, IsOwnerOrStaff
from .models import Payment
from .serializers import PaymentSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsOwnerOrStaff]
    filterset_fields = ['payment_method', 'invoice']
    ordering_fields = ['payment_date', 'amount', 'created_at']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Payment.objects.none()
        if user.role in ('admin', 'staff'):
            return Payment.objects.all().select_related('invoice', 'invoice__customer')
        return Payment.objects.filter(invoice__customer=user).select_related('invoice')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

