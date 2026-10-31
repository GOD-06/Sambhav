from rest_framework import serializers
from decimal import Decimal
from .models import TaxRule, Invoice, InvoiceLine


class TaxRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxRule
        fields = ['id', 'name', 'rate', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class InvoiceLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    variant_name = serializers.CharField(source='variant.name', read_only=True, default=None)

    class Meta:
        model = InvoiceLine
        fields = [
            'id', 'invoice', 'product', 'product_name', 'variant', 'variant_name',
            'description', 'quantity', 'unit_price', 'tax_rate', 'tax_amount',
            'discount_amount', 'line_total'
        ]
        read_only_fields = ['id', 'invoice', 'tax_amount', 'line_total']


class InvoiceSerializer(serializers.ModelSerializer):
    lines = InvoiceLineSerializer(many=True, required=False)
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    subscription_number = serializers.CharField(source='subscription.subscription_number', read_only=True, default=None)
    paid_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    outstanding_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'subscription', 'subscription_number',
            'customer', 'customer_email', 'customer_name', 'issue_date', 'due_date',
            'status', 'subtotal', 'tax_total', 'discount_total', 'total',
            'paid_amount', 'outstanding_amount', 'notes',
            'billing_period_start', 'billing_period_end', 'lines',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'invoice_number', 'created_at', 'updated_at']

    def create(self, validated_data):
        lines_data = validated_data.pop('lines', [])
        invoice = Invoice.objects.create(**validated_data)
        for line_data in lines_data:
            InvoiceLine.objects.create(invoice=invoice, **line_data)
        invoice.calculate_totals()
        return invoice

    def update(self, instance, validated_data):
        lines_data = validated_data.pop('lines', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if lines_data is not None:
            instance.lines.all().delete()
            for line_data in lines_data:
                InvoiceLine.objects.create(invoice=instance, **line_data)
            instance.calculate_totals()

        return instance
