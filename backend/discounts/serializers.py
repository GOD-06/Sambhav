from rest_framework import serializers
from .models import DiscountRule
from products.models import Product


class DiscountRuleSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    discount_type_display = serializers.CharField(source='get_discount_type_display', read_only=True)
    is_valid_now = serializers.SerializerMethodField()
    applicable_product_names = serializers.SerializerMethodField()

    class Meta:
        model = DiscountRule
        fields = [
            'id', 'name', 'discount_type', 'discount_type_display', 'value',
            'min_purchase_amount', 'min_quantity', 'start_date', 'end_date',
            'usage_limit', 'times_used', 'applicable_products', 'applicable_product_names',
            'apply_to_whole_subscription', 'is_active', 'is_valid_now',
            'created_by', 'created_by_email', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'times_used', 'created_by', 'created_at', 'updated_at']

    def get_is_valid_now(self, obj):
        return obj.is_valid()

    def get_applicable_product_names(self, obj):
        return [p.name for p in obj.applicable_products.all()]
