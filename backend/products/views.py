from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Product, ProductVariant, SubscriptionPlan
from .serializers import (
    ProductSerializer,
    ProductListSerializer,
    ProductVariantSerializer,
    SubscriptionPlanSerializer,
)
from accounts.permissions import IsStaffOrReadOnly, IsAdmin


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for products.
    Admin/Staff: full CRUD.
    Customers: read-only.
    """
    permission_classes = [IsAuthenticated, IsStaffOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active', 'product_type']
    search_fields = ['name', 'product_type', 'notes']
    ordering_fields = ['name', 'sales_price', 'created_at']

    def get_queryset(self):
        qs = Product.objects.all()
        if self.request.user.role == 'customer':
            qs = qs.filter(is_active=True)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ProductVariantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for product variants.
    Admin/Staff: full CRUD.
    Customers: read-only.
    """
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAuthenticated, IsStaffOrReadOnly]

    def get_queryset(self):
        qs = ProductVariant.objects.all()
        product_id = self.kwargs.get('product_pk') or self.request.query_params.get('product')
        if product_id:
            qs = qs.filter(product_id=product_id)
        if self.request.user.role == 'customer':
            qs = qs.filter(is_active=True)
        return qs

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_pk') or self.request.data.get('product')
        if product_id and 'product' not in serializer.validated_data:
            product = Product.objects.get(pk=product_id)
            serializer.save(product=product)
        else:
            serializer.save()


class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    """
    ViewSet for subscription plans.
    Admin: full CRUD.
    Others: read-only.
    """
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsAuthenticated, IsStaffOrReadOnly]
    filterset_fields = ['is_active', 'billing_frequency', 'product']
    search_fields = ['name']
    ordering_fields = ['name', 'price', 'created_at']

    def get_queryset(self):
        qs = SubscriptionPlan.objects.select_related('product').all()
        if self.request.user.role == 'customer':
            qs = qs.filter(is_active=True)
        return qs
