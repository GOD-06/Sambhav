from rest_framework import serializers
from decimal import Decimal
from .models import QuotationTemplate, Quotation, QuotationLine, Subscription, SubscriptionLine
from products.serializers import ProductSerializer, ProductVariantSerializer, SubscriptionPlanSerializer


class QuotationLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    variant_name = serializers.CharField(source='variant.name', read_only=True, default=None)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = QuotationLine
        fields = [
            'id', 'quotation', 'product', 'product_name', 'variant', 'variant_name',
            'quantity', 'unit_price', 'tax_rate', 'discount_amount', 'line_total'
        ]
        read_only_fields = ['id', 'quotation', 'line_total']


class QuotationTemplateSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)

    class Meta:
        model = QuotationTemplate
        fields = [
            'id', 'name', 'plan', 'plan_name', 'validity_days', 'notes',
            'created_by', 'created_by_email', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']


class QuotationSerializer(serializers.ModelSerializer):
    lines = QuotationLineSerializer(many=True, required=False)
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    tax_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Quotation
        fields = [
            'id', 'template', 'quotation_number', 'customer', 'customer_email',
            'customer_name', 'plan', 'plan_name', 'valid_until', 'status',
            'notes', 'created_by', 'lines', 'subtotal', 'tax_total', 'total',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'quotation_number', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        lines_data = validated_data.pop('lines', [])
        quotation = Quotation.objects.create(**validated_data)
        for line_data in lines_data:
            QuotationLine.objects.create(quotation=quotation, **line_data)
        return quotation

    def update(self, instance, validated_data):
        lines_data = validated_data.pop('lines', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if lines_data is not None:
            instance.lines.all().delete()
            for line_data in lines_data:
                QuotationLine.objects.create(quotation=instance, **line_data)

        return instance


class SubscriptionLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    variant_name = serializers.CharField(source='variant.name', read_only=True, default=None)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = SubscriptionLine
        fields = [
            'id', 'subscription', 'product', 'product_name', 'variant', 'variant_name',
            'quantity', 'unit_price', 'tax_rate', 'discount_amount', 'line_total'
        ]
        read_only_fields = ['id', 'subscription', 'line_total']


class SubscriptionSerializer(serializers.ModelSerializer):
    lines = SubscriptionLineSerializer(many=True, required=False)
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    tax_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Subscription
        fields = [
            'id', 'subscription_number', 'customer', 'customer_email',
            'customer_name', 'plan', 'plan_name', 'quotation', 'start_date',
            'end_date', 'next_billing_date', 'payment_terms', 'status',
            'created_by', 'lines', 'subtotal', 'tax_total', 'total',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'subscription_number', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        lines_data = validated_data.pop('lines', [])
        subscription = Subscription.objects.create(**validated_data)
        for line_data in lines_data:
            SubscriptionLine.objects.create(subscription=subscription, **line_data)
        return subscription

    def update(self, instance, validated_data):
        lines_data = validated_data.pop('lines', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if lines_data is not None:
            instance.lines.all().delete()
            for line_data in lines_data:
                SubscriptionLine.objects.create(subscription=instance, **line_data)

        return instance
