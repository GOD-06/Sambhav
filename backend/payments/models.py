from django.db import models
from django.conf import settings
from decimal import Decimal


class Payment(models.Model):
    """Payment recorded against an invoice."""

    PAYMENT_METHOD_CHOICES = (
        ('bank_transfer', 'Bank Transfer'),
        ('credit_card', 'Credit Card'),
        ('cash', 'Cash'),
        ('cheque', 'Cheque'),
        ('other', 'Other'),
    )

    invoice = models.ForeignKey(
        'invoices.Invoice',
        on_delete=models.CASCADE,
        related_name='payments',
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='bank_transfer',
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField()
    note = models.TextField(blank=True, default='')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_payments',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-payment_date', '-created_at']

    def __str__(self):
        return f"Payment {self.id} - {self.invoice.invoice_number} (${self.amount})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update invoice status if fully paid
        invoice = self.invoice
        total_paid = sum(p.amount for p in invoice.payments.all())
        if total_paid >= invoice.total and invoice.status != 'paid':
            invoice.status = 'paid'
            invoice.save(update_fields=['status'])
