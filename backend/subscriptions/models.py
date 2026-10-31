from django.db import models
from django.conf import settings
from decimal import Decimal


class QuotationTemplate(models.Model):
    """Reusable template for creating quotations."""

    name = models.CharField(max_length=255)
    plan = models.ForeignKey(
        'products.SubscriptionPlan',
        on_delete=models.CASCADE,
        related_name='quotation_templates',
    )
    validity_days = models.PositiveIntegerField(default=30)
    notes = models.TextField(blank=True, default='')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='quotation_templates',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Quotation(models.Model):
    """Sales quotation sent to customers."""

    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    )

    template = models.ForeignKey(
        QuotationTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quotations',
    )
    quotation_number = models.CharField(max_length=20, unique=True, editable=False)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quotations',
        limit_choices_to={'role': 'customer'},
    )
    plan = models.ForeignKey(
        'products.SubscriptionPlan',
        on_delete=models.CASCADE,
        related_name='quotations',
    )
    valid_until = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    notes = models.TextField(blank=True, default='')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_quotations',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.quotation_number} - {self.customer.email}"

    def save(self, *args, **kwargs):
        if not self.quotation_number:
            last = Quotation.objects.order_by('-id').first()
            next_num = (last.id + 1) if last else 1
            self.quotation_number = f"QT-{next_num:05d}"
        super().save(*args, **kwargs)

    @property
    def subtotal(self):
        return sum(line.line_total for line in self.lines.all())

    @property
    def tax_total(self):
        return sum(
            line.unit_price * line.quantity * line.tax_rate / Decimal('100')
            for line in self.lines.all()
        )

    @property
    def total(self):
        return self.subtotal + self.tax_total


class QuotationLine(models.Model):
    """Line item within a quotation."""

    quotation = models.ForeignKey(
        Quotation,
        on_delete=models.CASCADE,
        related_name='lines',
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
    )
    variant = models.ForeignKey(
        'products.ProductVariant',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.quotation.quotation_number} - {self.product.name}"

    @property
    def line_total(self):
        """Calculate line total: (unit_price * quantity) - discount."""
        return (self.unit_price * self.quantity) - self.discount_amount


class Subscription(models.Model):
    """Active subscription linked to a customer and plan."""

    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('quotation', 'Quotation'),
        ('confirmed', 'Confirmed'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('closed', 'Closed'),
    )

    subscription_number = models.CharField(max_length=20, unique=True, editable=False)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscriptions',
        limit_choices_to={'role': 'customer'},
    )
    plan = models.ForeignKey(
        'products.SubscriptionPlan',
        on_delete=models.CASCADE,
        related_name='subscriptions',
    )
    quotation = models.ForeignKey(
        Quotation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subscriptions',
    )
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    next_billing_date = models.DateField(null=True, blank=True)
    payment_terms = models.CharField(max_length=100, default='Net 30')
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='draft')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_subscriptions',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subscription_number} - {self.customer.email}"

    def save(self, *args, **kwargs):
        if not self.subscription_number:
            last = Subscription.objects.order_by('-id').first()
            next_num = (last.id + 1) if last else 1
            self.subscription_number = f"SUB-{next_num:05d}"
        super().save(*args, **kwargs)

    @property
    def subtotal(self):
        return sum(line.line_total for line in self.lines.all())

    @property
    def tax_total(self):
        return sum(
            line.unit_price * line.quantity * line.tax_rate / Decimal('100')
            for line in self.lines.all()
        )

    @property
    def total(self):
        return self.subtotal + self.tax_total


class SubscriptionLine(models.Model):
    """Line item within a subscription."""

    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
        related_name='lines',
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
    )
    variant = models.ForeignKey(
        'products.ProductVariant',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    line_total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.subscription.subscription_number} - {self.product.name}"

    def save(self, *args, **kwargs):
        self.line_total = (self.unit_price * self.quantity) - self.discount_amount
        super().save(*args, **kwargs)
