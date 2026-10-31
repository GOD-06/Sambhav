from django.db import models
from django.conf import settings
from decimal import Decimal


class TaxRule(models.Model):
    """Tax rule configured by admin (e.g., VAT 20%, Sales Tax 8.5%)."""

    name = models.CharField(max_length=100)
    rate = models.DecimalField(max_digits=5, decimal_places=2, help_text='Tax percentage, e.g. 20.00 for 20%')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.rate}%)"


class Invoice(models.Model):
    """Invoice generated for subscriptions or one-time orders."""

    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    )

    invoice_number = models.CharField(max_length=20, unique=True, editable=False)
    subscription = models.ForeignKey(
        'subscriptions.Subscription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices',
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='invoices',
        limit_choices_to={'role': 'customer'},
    )
    issue_date = models.DateField()
    due_date = models.DateField()
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='draft')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax_total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    discount_total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    notes = models.TextField(blank=True, default='')
    billing_period_start = models.DateField(null=True, blank=True)
    billing_period_end = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.invoice_number} - {self.customer.email} (${self.total})"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            last = Invoice.objects.order_by('-id').first()
            next_num = (last.id + 1) if last else 1
            self.invoice_number = f"INV-{next_num:05d}"
        super().save(*args, **kwargs)

    def calculate_totals(self):
        lines = self.lines.all()
        self.subtotal = sum((line.unit_price * line.quantity) for line in lines)
        self.discount_total = sum(line.discount_amount for line in lines)
        self.tax_total = sum(line.tax_amount for line in lines)
        self.total = self.subtotal - self.discount_total + self.tax_total
        self.save(update_fields=['subtotal', 'tax_total', 'discount_total', 'total'])

    @property
    def paid_amount(self):
        payments = self.payments.all()
        return sum(p.amount for p in payments)

    @property
    def outstanding_amount(self):
        return max(Decimal('0.00'), self.total - self.paid_amount)


class InvoiceLine(models.Model):
    """Line item within an invoice."""

    invoice = models.ForeignKey(
        Invoice,
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
    description = models.CharField(max_length=255, blank=True, default='')
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    line_total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.product.name}"

    def save(self, *args, **kwargs):
        base = self.unit_price * self.quantity
        discounted = max(Decimal('0.00'), base - self.discount_amount)
        self.tax_amount = (discounted * self.tax_rate) / Decimal('100')
        self.line_total = discounted + self.tax_amount
        super().save(*args, **kwargs)
