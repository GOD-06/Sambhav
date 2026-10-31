from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import Product, ProductVariant, SubscriptionPlan
from subscriptions.models import Quotation, QuotationLine, QuotationTemplate, Subscription, SubscriptionLine
from invoices.models import Invoice, InvoiceLine, TaxRule
from payments.models import Payment
from discounts.models import DiscountRule

User = get_user_model()


class Command(BaseCommand):
    help = 'Clears all fabricated demo data and leaves only the primary admin user'

    def handle(self, *args, **options):
        self.stdout.write("Removing all fabricated data...")

        # Delete transactional records
        Payment.objects.all().delete()
        InvoiceLine.objects.all().delete()
        Invoice.objects.all().delete()
        SubscriptionLine.objects.all().delete()
        Subscription.objects.all().delete()
        QuotationLine.objects.all().delete()
        Quotation.objects.all().delete()
        QuotationTemplate.objects.all().delete()

        # Delete catalog and rules
        DiscountRule.objects.all().delete()
        TaxRule.objects.all().delete()
        ProductVariant.objects.all().delete()
        SubscriptionPlan.objects.all().delete()
        Product.objects.all().delete()

        # Delete all non-admin users
        User.objects.filter(role__in=['staff', 'customer']).delete()

        # Ensure a clean admin account exists
        admin_user, created = User.objects.get_or_create(
            email='admin@brightloop.com',
            defaults={
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('Admin@123')
        admin_user.save()

        self.stdout.write(self.style.SUCCESS("All fabricated records removed."))
        self.stdout.write(self.style.SUCCESS("Clean admin preserved: admin@brightloop.com"))

