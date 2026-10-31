from datetime import date, timedelta
from decimal import Decimal
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.permissions import IsStaffUser
from subscriptions.models import Subscription
from invoices.models import Invoice
from payments.models import Payment


class DashboardStatsView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        today = date.today()

        # 1. Active Subscriptions
        active_subs_count = Subscription.objects.filter(status='active').count()

        # 2. Total Revenue (sum of all recorded payments)
        revenue_sum = Payment.objects.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # 3. Invoices calculation
        active_invoices = Invoice.objects.exclude(status__in=['draft', 'cancelled'])
        
        # Outstanding
        total_billed = active_invoices.aggregate(total=Sum('total'))['total'] or Decimal('0.00')
        total_outstanding = max(Decimal('0.00'), total_billed - revenue_sum)

        # Overdue Invoices
        overdue_qs = Invoice.objects.filter(
            due_date__lt=today,
        ).exclude(status__in=['paid', 'cancelled'])

        overdue_count = overdue_qs.count()
        overdue_invoices = [
            {
                'id': inv.id,
                'invoice_number': inv.invoice_number,
                'customer_email': inv.customer.email,
                'customer_name': inv.customer.get_full_name(),
                'total': inv.total,
                'outstanding': inv.outstanding_amount,
                'due_date': inv.due_date,
            }
            for inv in overdue_qs.order_by('due_date')[:10]
        ]

        # Recent Invoices
        recent_qs = Invoice.objects.all().order_by('-created_at')[:10]
        recent_invoices = [
            {
                'id': inv.id,
                'invoice_number': inv.invoice_number,
                'customer_email': inv.customer.email,
                'customer_name': inv.customer.get_full_name(),
                'total': inv.total,
                'status': inv.status,
                'issue_date': inv.issue_date,
                'due_date': inv.due_date,
            }
            for inv in recent_qs
        ]

        # Monthly Revenue breakdown (last 6 months)
        monthly_data = []
        for i in range(5, -1, -1):
            # approximate months
            m_date = today - timedelta(days=i * 30)
            m_year = m_date.year
            m_month = m_date.month
            m_label = m_date.strftime('%b %Y')
            
            p_sum = Payment.objects.filter(
                payment_date__year=m_year,
                payment_date__month=m_month
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            monthly_data.append({
                'month': m_label,
                'revenue': float(p_sum),
            })

        return Response({
            'active_subscriptions_count': active_subs_count,
            'total_revenue': float(revenue_sum),
            'total_outstanding': float(total_outstanding),
            'overdue_invoices_count': overdue_count,
            'overdue_invoices': overdue_invoices,
            'recent_invoices': recent_invoices,
            'revenue_chart': monthly_data,
        })

