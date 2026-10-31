from django.contrib import admin
from .models import Product, ProductVariant, SubscriptionPlan


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_type', 'sales_price', 'cost_price', 'is_active', 'created_at')
    list_filter = ('is_active', 'product_type')
    search_fields = ('name', 'product_type')
    inlines = [ProductVariantInline]


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('name', 'product', 'price_adjustment', 'is_active')
    list_filter = ('is_active',)


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'product', 'price', 'billing_frequency', 'is_active')
    list_filter = ('billing_frequency', 'is_active')
    search_fields = ('name',)
