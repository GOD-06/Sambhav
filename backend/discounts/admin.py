from django.contrib import admin
from .models import DiscountRule


@admin.register(DiscountRule)
class DiscountRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'discount_type', 'value', 'start_date', 'end_date', 'usage_limit', 'times_used', 'is_active')
    list_filter = ('discount_type', 'is_active')
    search_fields = ('name',)

