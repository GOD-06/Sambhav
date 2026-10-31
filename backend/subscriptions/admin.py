from django.contrib import admin
from .models import QuotationTemplate, Quotation, QuotationLine, Subscription, SubscriptionLine


class QuotationLineInline(admin.TabularInline):
    model = QuotationLine
    extra = 1


@admin.register(QuotationTemplate)
class QuotationTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'plan', 'validity_days', 'created_by', 'created_at')
    search_fields = ('name',)


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = ('quotation_number', 'customer', 'plan', 'valid_until', 'status', 'created_at')
    list_filter = ('status', 'plan')
    search_fields = ('quotation_number', 'customer__email')
    inlines = [QuotationLineInline]


class SubscriptionLineInline(admin.TabularInline):
    model = SubscriptionLine
    extra = 1


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('subscription_number', 'customer', 'plan', 'status', 'start_date', 'next_billing_date')
    list_filter = ('status', 'plan')
    search_fields = ('subscription_number', 'customer__email')
    inlines = [SubscriptionLineInline]
