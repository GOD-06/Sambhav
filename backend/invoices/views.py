from datetime import date, timedelta
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import IsStaffUser, IsOwnerOrStaff, IsAdmin
from .models import TaxRule, Invoice, InvoiceLine
from .serializers import TaxRuleSerializer, InvoiceSerializer
from subscriptions.models import Subscription, SubscriptionLine
from subscriptions.views import calculate_next_billing_date


class TaxRuleViewSet(viewsets.ModelViewSet):
    queryset = TaxRule.objects.all()
    serializer_class = TaxRuleSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsStaffUser()]


class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [IsOwnerOrStaff]
    filterset_fields = ['status', 'customer', 'subscription']
    search_fields = ['invoice_number', 'customer__email', 'customer__first_name', 'customer__last_name']
    ordering_fields = ['created_at', 'issue_date', 'due_date', 'total', 'status']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Invoice.objects.none()
        if user.role in ('admin', 'staff'):
            return Invoice.objects.all().prefetch_related('lines', 'payments')
        return Invoice.objects.filter(customer=user).prefetch_related('lines', 'payments')

    @action(detail=True, methods=['post'], permission_classes=[IsStaffUser])
    def confirm(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status != 'draft':
            return Response({'error': f'Only draft invoices can be confirmed. Current status: {invoice.status}'}, status=status.HTTP_400_BAD_REQUEST)
        invoice.status = 'confirmed'
        invoice.save()
        return Response({'message': 'Invoice confirmed.', 'status': invoice.status})

    @action(detail=True, methods=['post'], permission_classes=[IsStaffUser])
    def cancel(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status == 'paid':
            return Response({'error': 'Cannot cancel an invoice that has already been paid.'}, status=status.HTTP_400_BAD_REQUEST)
        invoice.status = 'cancelled'
        invoice.save()
        return Response({'message': 'Invoice cancelled.', 'status': invoice.status})

    @action(detail=True, methods=['post'], permission_classes=[IsStaffUser])
    def send_invoice(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status in ('draft', 'confirmed'):
            invoice.status = 'sent'
            invoice.save()
        return Response({'message': f'Invoice {invoice.invoice_number} sent to {invoice.customer.email}.', 'status': invoice.status})

    @action(detail=True, methods=['get'], permission_classes=[IsOwnerOrStaff])
    def print_invoice(self, request, pk=None):
        invoice = self.get_object()
        serializer = self.get_serializer(invoice)
        return Response({
            'company': {
                'name': 'Subscription Management System Inc.',
                'address': '100 Innovation Way, Tech Park',
                'email': 'billing@subscriptionmanagement.com',
                'phone': '+1 (800) 555-0199',
            },
            'invoice': serializer.data,
        })

    @action(detail=False, methods=['post'], permission_classes=[IsStaffUser], url_path='generate-invoices')
    def generate_invoices(self, request):
        """Batch generate invoices for all active subscriptions due for billing."""
        today = date.today()
        subs_due = Subscription.objects.filter(
            status='active',
            next_billing_date__lte=today,
        )

        generated_count = 0
        skipped_count = 0
        created_invoices = []

        for sub in subs_due:
            # Prevent duplicate billing for overlapping period
            period_start = sub.next_billing_date
            period_end = calculate_next_billing_date(period_start, sub.plan.billing_frequency) - timedelta(days=1)
            
            existing = Invoice.objects.filter(
                subscription=sub,
                billing_period_start=period_start,
                status__in=['draft', 'confirmed', 'sent', 'paid']
            ).exists()

            if existing:
                skipped_count += 1
                continue

            # Create invoice
            inv = Invoice.objects.create(
                subscription=sub,
                customer=sub.customer,
                issue_date=today,
                due_date=today + timedelta(days=30),
                status='confirmed',
                billing_period_start=period_start,
                billing_period_end=period_end,
                notes=f"Auto-generated billing for {sub.plan.name} ({period_start} to {period_end})",
            )

            for line in sub.lines.all():
                InvoiceLine.objects.create(
                    invoice=inv,
                    product=line.product,
                    variant=line.variant,
                    description=f"{line.product.name}" + (f" - {line.variant.name}" if line.variant else ""),
                    quantity=line.quantity,
                    unit_price=line.unit_price,
                    tax_rate=line.tax_rate,
                    discount_amount=line.discount_amount,
                )

            inv.calculate_totals()
            created_invoices.append(inv.invoice_number)
            generated_count += 1

            # Advance next billing date
            sub.next_billing_date = calculate_next_billing_date(sub.next_billing_date, sub.plan.billing_frequency)
            sub.save()

        return Response({
            'message': f"Billing run completed. {generated_count} invoices generated, {skipped_count} skipped.",
            'generated_count': generated_count,
            'skipped_count': skipped_count,
            'invoices': created_invoices,
        })

