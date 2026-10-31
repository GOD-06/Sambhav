from rest_framework import viewsets
from accounts.permissions import IsStaffUser, IsAdmin
from .models import DiscountRule
from .serializers import DiscountRuleSerializer


class DiscountRuleViewSet(viewsets.ModelViewSet):
    queryset = DiscountRule.objects.all().prefetch_related('applicable_products')
    serializer_class = DiscountRuleSerializer
    filterset_fields = ['discount_type', 'is_active', 'apply_to_whole_subscription']
    search_fields = ['name']
    ordering_fields = ['created_at', 'start_date', 'value']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsStaffUser()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

