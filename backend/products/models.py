from django.db import models
from django.conf import settings


class Product(models.Model):
    """Product model representing a sellable item."""

    name = models.CharField(max_length=255)
    product_type = models.CharField(max_length=100)
    sales_price = models.DecimalField(max_digits=12, decimal_places=2)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2)
    notes = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_products',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class ProductVariant(models.Model):
    """Variant of a product with price adjustments."""

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='variants',
    )
    name = models.CharField(max_length=255)
    price_adjustment = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text='Can be positive or negative',
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.product.name} - {self.name}"

    @property
    def effective_price(self):
        """Calculate the effective price based on product price + adjustment."""
        return self.product.sales_price + self.price_adjustment


class SubscriptionPlan(models.Model):
    """Subscription plan configuration."""

    BILLING_FREQUENCY_CHOICES = (
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    )

    name = models.CharField(max_length=255)
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subscription_plans',
    )
    price = models.DecimalField(max_digits=12, decimal_places=2)
    billing_frequency = models.CharField(
        max_length=10,
        choices=BILLING_FREQUENCY_CHOICES,
        default='monthly',
    )
    min_quantity = models.PositiveIntegerField(default=1)
    availability_start = models.DateField()
    availability_end = models.DateField(null=True, blank=True)
    auto_close_on_end = models.BooleanField(default=False)
    allow_early_close = models.BooleanField(default=True)
    allow_pause = models.BooleanField(default=True)
    allow_renewal = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.get_billing_frequency_display()})"
