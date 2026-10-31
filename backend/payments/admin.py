from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'invoice', 'payment_method', 'amount', 'payment_date', 'created_by', 'created_at')
    list_filter = ('payment_method', 'payment_date')
    search_fields = ('invoice__invoice_number', 'note')

