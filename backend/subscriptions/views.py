from datetime import date, timedelta
from decimal import Decimal
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsStaffUser, IsOwnerOrStaff
from products.models import Product, SubscriptionPlan
from .models import QuotationTemplate, Quotation, Subscription, SubscriptionLine
from .serializers import (
    QuotationTemplateSerializer,
    QuotationSerializer,
    SubscriptionSerializer,
)


def calculate_next_billing_date(start_date, frequency):
    """Calculate next billing date based on frequency."""
    if frequency == 'daily':
        return start_date + timedelta(days=1)
    elif frequency == 'weekly':
        return start_date + timedelta(weeks=1)
    elif frequency == 'monthly':
        # approximate 30 days or same day next month
        year = start_date.year + (start_date.month // 12)
        month = (start_date.month % 12) + 1
        day = min(start_date.day, 28)
        return date(year, month, day)
    elif frequency == 'yearly':
        try:
            return start_date.replace(year=start_date.year + 1)
        except ValueError:
            return start_date + timedelta(days=365)
    return start_date + timedelta(days=30)


class QuotationTemplateViewSet(viewsets.ModelViewSet):
    queryset = QuotationTemplate.objects.all()
    serializer_class = QuotationTemplateSerializer
    permission_classes = [IsStaffUser]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class QuotationViewSet(viewsets.ModelViewSet):
    serializer_class = QuotationSerializer
    permission_classes = [IsOwnerOrStaff]
    filterset_fields = ['status', 'customer', 'plan']
    search_fields = ['quotation_number', 'customer__email', 'customer__first_name', 'customer__last_name']
    ordering_fields = ['created_at', 'valid_until', 'quotation_number']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Quotation.objects.none()
        if user.role in ('admin', 'staff'):
            return Quotation.objects.all().prefetch_related('lines')
        return Quotation.objects.filter(customer=user).prefetch_related('lines')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsOwnerOrStaff])
    def accept(self, request, pk=None):
        """Accept a quotation and automatically create a confirmed subscription."""
        quotation = self.get_object()
        if quotation.status == 'accepted':
            return Response({'error': 'Quotation is already accepted.'}, status=status.HTTP_400_BAD_REQUEST)
        if quotation.status in ('rejected', 'expired'):
            return Response({'error': f'Cannot accept quotation in {quotation.status} status.'}, status=status.HTTP_400_BAD_REQUEST)

        quotation.status = 'accepted'
        quotation.save()

        # Create subscription
        today = date.today()
        sub = Subscription.objects.create(
            customer=quotation.customer,
            plan=quotation.plan,
            quotation=quotation,
            start_date=today,
            next_billing_date=calculate_next_billing_date(today, quotation.plan.billing_frequency),
            payment_terms='Net 30',
            status='confirmed',
            created_by=request.user,
        )

        for line in quotation.lines.all():
            SubscriptionLine.objects.create(
                subscription=sub,
                product=line.product,
                variant=line.variant,
                quantity=line.quantity,
                unit_price=line.unit_price,
                tax_rate=line.tax_rate,
                discount_amount=line.discount_amount,
                line_total=line.line_total,
            )

        return Response({
            'message': 'Quotation accepted and subscription created successfully.',
            'subscription_id': sub.id,
            'subscription_number': sub.subscription_number,
        })


class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsOwnerOrStaff]
    filterset_fields = ['status', 'customer', 'plan']
    search_fields = ['subscription_number', 'customer__email', 'customer__first_name', 'customer__last_name']
    ordering_fields = ['created_at', 'start_date', 'next_billing_date', 'status']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Subscription.objects.none()
        if user.role in ('admin', 'staff'):
            return Subscription.objects.all().prefetch_related('lines')
        return Subscription.objects.filter(customer=user).prefetch_related('lines')

    def perform_create(self, serializer):
        sub = serializer.save(created_by=self.request.user)
        if not sub.next_billing_date and sub.start_date:
            sub.next_billing_date = calculate_next_billing_date(sub.start_date, sub.plan.billing_frequency)
            sub.save()

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def subscribe(self, request):
        """
        Customer endpoint to subscribe to a plan and optionally pay immediately.
        Accepts: { plan_id, payment_method, note }
        """
        plan_id = request.data.get('plan_id')
        if not plan_id:
            return Response({'error': 'Plan ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            return Response({'error': 'Subscription plan not found or inactive.'}, status=status.HTTP_404_NOT_FOUND)

        customer = request.user
        if request.user.role in ('admin', 'staff') and request.data.get('customer_id'):
            from accounts.models import User
            try:
                customer = User.objects.get(id=request.data.get('customer_id'))
            except User.DoesNotExist:
                return Response({'error': 'Customer not found.'}, status=status.HTTP_404_NOT_FOUND)

        today = date.today()
        next_billing = calculate_next_billing_date(today, plan.billing_frequency)

        # Create subscription
        sub = Subscription.objects.create(
            customer=customer,
            plan=plan,
            start_date=today,
            next_billing_date=next_billing,
            payment_terms='Immediate',
            status='active',
            created_by=customer,
        )

        # Ensure product
        product = plan.product
        if not product:
            product = Product.objects.first()
            if not product:
                product = Product.objects.create(
                    name=plan.name,
                    product_type='Software',
                    sales_price=plan.price,
                    cost_price=Decimal('0.00'),
                )

        SubscriptionLine.objects.create(
            subscription=sub,
            product=product,
            quantity=1,
            unit_price=plan.price,
            tax_rate=Decimal('0.00'),
            discount_amount=Decimal('0.00'),
            line_total=plan.price,
        )

        # Create invoice
        from invoices.models import Invoice, InvoiceLine
        from payments.models import Payment

        invoice = Invoice.objects.create(
            subscription=sub,
            customer=customer,
            issue_date=today,
            due_date=today + timedelta(days=7),
            status='paid',
            subtotal=plan.price,
            tax_total=Decimal('0.00'),
            discount_total=Decimal('0.00'),
            total=plan.price,
            billing_period_start=today,
            billing_period_end=next_billing - timedelta(days=1),
            notes=f'Initial billing for {plan.name}',
        )

        InvoiceLine.objects.create(
            invoice=invoice,
            product=product,
            description=f'{plan.name} ({plan.get_billing_frequency_display()})',
            quantity=1,
            unit_price=plan.price,
            tax_rate=Decimal('0.00'),
            discount_amount=Decimal('0.00'),
        )
        invoice.calculate_totals()

        # Create payment
        payment_method = request.data.get('payment_method', 'credit_card')
        note = request.data.get('note', f'Online checkout for {plan.name}')
        payment = Payment.objects.create(
            invoice=invoice,
            payment_method=payment_method,
            amount=invoice.total,
            payment_date=today,
            note=note,
            created_by=customer,
        )

        return Response({
            'message': f'Subscribed to {plan.name} successfully.',
            'subscription_id': sub.id,
            'subscription_number': sub.subscription_number,
            'invoice_id': invoice.id,
            'invoice_number': invoice.invoice_number,
            'payment_id': payment.id,
            'amount': float(payment.amount),
            'payment_method': payment.payment_method,
            'payment_date': str(payment.payment_date),
            'status': sub.status,
            'plan_name': plan.name,
            'billing_frequency': plan.billing_frequency,
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsStaffUser])
    def activate(self, request, pk=None):
        sub = self.get_object()
        if sub.status == 'active':
            return Response({'error': 'Subscription is already active.'}, status=status.HTTP_400_BAD_REQUEST)
        sub.status = 'active'
        if not sub.next_billing_date:
            sub.next_billing_date = calculate_next_billing_date(date.today(), sub.plan.billing_frequency)
        sub.save()
        return Response({'message': 'Subscription activated.', 'status': sub.status, 'next_billing_date': sub.next_billing_date})

    @action(detail=True, methods=['post'], permission_classes=[IsStaffUser])
    def pause(self, request, pk=None):
        sub = self.get_object()
        if not sub.plan.allow_pause:
            return Response({'error': 'The plan does not allow pausing.'}, status=status.HTTP_400_BAD_REQUEST)
        if sub.status != 'active':
            return Response({'error': 'Only active subscriptions can be paused.'}, status=status.HTTP_400_BAD_REQUEST)
        sub.status = 'paused'
        sub.save()
        return Response({'message': 'Subscription paused.', 'status': sub.status})

    @action(detail=True, methods=['post'], permission_classes=[IsStaffUser])
    def resume(self, request, pk=None):
        sub = self.get_object()
        if sub.status != 'paused':
            return Response({'error': 'Only paused subscriptions can be resumed.'}, status=status.HTTP_400_BAD_REQUEST)
        sub.status = 'active'
        sub.save()
        return Response({'message': 'Subscription resumed.', 'status': sub.status})

    @action(detail=True, methods=['post'], permission_classes=[IsStaffUser])
    def close(self, request, pk=None):
        sub = self.get_object()
        if sub.status == 'closed':
            return Response({'error': 'Subscription is already closed.'}, status=status.HTTP_400_BAD_REQUEST)
        if not sub.plan.allow_early_close and sub.end_date and date.today() < sub.end_date:
            return Response({'error': 'This plan does not permit early closure.'}, status=status.HTTP_400_BAD_REQUEST)
        sub.status = 'closed'
        sub.save()
        return Response({'message': 'Subscription closed.', 'status': sub.status})

    @action(detail=True, methods=['post'], permission_classes=[IsStaffUser])
    def renew(self, request, pk=None):
        sub = self.get_object()
        if not sub.plan.allow_renewal:
            return Response({'error': 'This plan does not allow renewal.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Extend or reactivate
        sub.status = 'active'
        today = date.today()
        sub.start_date = today
        sub.next_billing_date = calculate_next_billing_date(today, sub.plan.billing_frequency)
        sub.save()
        return Response({'message': 'Subscription renewed successfully.', 'status': sub.status, 'next_billing_date': sub.next_billing_date})

