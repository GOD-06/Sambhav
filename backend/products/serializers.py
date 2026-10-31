from rest_framework import serializers
from .models import Product, ProductVariant, SubscriptionPlan


class ProductVariantSerializer(serializers.ModelSerializer):
    effective_price = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True,
    )

    class Meta:
        model = ProductVariant
        fields = [
            'id', 'product', 'name', 'price_adjustment',
            'effective_price', 'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'product_type', 'sales_price', 'cost_price',
            'notes', 'is_active', 'created_by', 'created_by_email',
            'variants', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class ProductListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views."""
    variant_count = serializers.IntegerField(source='variants.count', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'product_type', 'sales_price', 'cost_price',
            'is_active', 'variant_count', 'created_at',
        ]


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True, default=None)
    billing_frequency_display = serializers.CharField(
        source='get_billing_frequency_display', read_only=True,
    )

    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'name', 'product', 'product_name', 'price',
            'billing_frequency', 'billing_frequency_display',
            'min_quantity', 'availability_start', 'availability_end',
            'auto_close_on_end', 'allow_early_close', 'allow_pause',
            'allow_renewal', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
