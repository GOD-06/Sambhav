from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    customer_email = serializers.EmailField(source='invoice.customer.email', read_only=True)
    customer_name = serializers.CharField(source='invoice.customer.get_full_name', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    recorded_by_email = serializers.EmailField(source='created_by.email', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'invoice', 'invoice_number', 'customer_email', 'customer_name',
            'payment_method', 'payment_method_display', 'amount', 'payment_date',
            'note', 'created_by', 'recorded_by_email', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']
