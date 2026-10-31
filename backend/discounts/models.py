from datetime import date
from django.db import models
from django.conf import settings
from decimal import Decimal


class DiscountRule(models.Model):
    """Discount rule created by admin."""

    DISCOUNT_TYPE_CHOICES = (
        ('fixed', 'Fixed Amount'),
        ('percentage', 'Percentage'),
    )

    name = models.CharField(max_length=255)
    discount_type = models.CharField(max_length=12, choices=DISCOUNT_TYPE_CHOICES, default='percentage')
    value = models.DecimalField(max_digits=12, decimal_places=2, help_text='Fixed amount ($) or percentage (%)')
    min_purchase_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    min_quantity = models.PositiveIntegerField(null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True, help_text='Maximum times this rule can be used')
    times_used = models.PositiveIntegerField(default=0)
    applicable_products = models.ManyToManyField(
        'products.Product',
        blank=True,
        related_name='discount_rules',
    )
    apply_to_whole_subscription = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_discounts',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        type_str = f"{self.value}%" if self.discount_type == 'percentage' else f"${self.value}"
        return f"{self.name} ({type_str})"

    def is_valid(self, check_date=None):
        if not self.is_active:
            return False
        today = check_date or date.today()
        if today < self.start_date:
            return False
        if self.end_date and today > self.end_date:
            return False
        if self.usage_limit and self.times_used >= self.usage_limit:
            return False
        return True

    def calculate_discount(self, amount, quantity=1):
        if not self.is_valid():
            return Decimal('0.00')
        if self.min_purchase_amount and amount < self.min_purchase_amount:
            return Decimal('0.00')
        if self.min_quantity and quantity < self.min_quantity:
            return Decimal('0.00')

        if self.discount_type == 'fixed':
            return min(self.value, amount)
        elif self.discount_type == 'percentage':
            return (amount * self.value) / Decimal('100')
        return Decimal('0.00')
