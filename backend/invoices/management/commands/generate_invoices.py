from datetime import date, timedelta
from django.core.management.base import BaseCommand
from subscriptions.models import Subscription
from subscriptions.views import calculate_next_billing_date
from invoices.models import Invoice, InvoiceLine


class Command(BaseCommand):
    help = 'Batch generate recurring invoices for active subscriptions due today'

    def handle(self, *args, **options):
        today = date.today()
        self.stdout.write(f"Running invoice generation for {today}...")

        subs_due = Subscription.objects.filter(
            status='active',
            next_billing_date__lte=today,
        )

        generated = 0
        skipped = 0

        for sub in subs_due:
            period_start = sub.next_billing_date
            period_end = calculate_next_billing_date(period_start, sub.plan.billing_frequency) - timedelta(days=1)

            # Prevent duplicate billing
            existing = Invoice.objects.filter(
                subscription=sub,
                billing_period_start=period_start,
                status__in=['draft', 'confirmed', 'sent', 'paid']
            ).exists()

            if existing:
                skipped += 1
                continue

            inv = Invoice.objects.create(
                subscription=sub,
                customer=sub.customer,
                issue_date=today,
                due_date=today + timedelta(days=30),
                status='confirmed',
                billing_period_start=period_start,
                billing_period_end=period_end,
                notes=f"Auto-generated billing for {sub.plan.name}",
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
            generated += 1

            # Advance next billing date
            sub.next_billing_date = calculate_next_billing_date(sub.next_billing_date, sub.plan.billing_frequency)
            sub.save()

        self.stdout.write(self.style.SUCCESS(
            f"Billing completed: {generated} invoices created, {skipped} skipped."
        ))
