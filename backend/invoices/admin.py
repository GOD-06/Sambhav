from django.contrib import admin
from .models import TaxRule, Invoice, InvoiceLine


@admin.register(TaxRule)
class TaxRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'rate', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name',)


class InvoiceLineInline(admin.TabularInline):
    model = InvoiceLine
    extra = 1


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'customer', 'subscription', 'issue_date', 'due_date', 'status', 'total')
    list_filter = ('status', 'issue_date')
    search_fields = ('invoice_number', 'customer__email')
    inlines = [InvoiceLineInline]

