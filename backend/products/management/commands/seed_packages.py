from datetime import date
from decimal import Decimal
from django.core.management.base import BaseCommand
from products.models import Product, SubscriptionPlan


class Command(BaseCommand):
    help = 'Seed dummy subscription packages for customers to subscribe to'

    def handle(self, *args, **options):
        # Create core products
        p_starter, _ = Product.objects.get_or_create(
            name='Starter Edition',
            defaults={
                'product_type': 'Software',
                'sales_price': Decimal('29.00'),
                'cost_price': Decimal('5.00'),
                'notes': 'Basic tier for individual professionals and small projects.',
            }
        )

        p_pro, _ = Product.objects.get_or_create(
            name='Professional Suite',
            defaults={
                'product_type': 'Software',
                'sales_price': Decimal('79.00'),
                'cost_price': Decimal('12.00'),
                'notes': 'Complete toolkit for scaling teams and recurring billing.',
            }
        )

        p_enterprise, _ = Product.objects.get_or_create(
            name='Enterprise Cloud',
            defaults={
                'product_type': 'Software',
                'sales_price': Decimal('199.00'),
                'cost_price': Decimal('25.00'),
                'notes': 'High-availability infrastructure with custom SLAs and audit logs.',
            }
        )

        # Create subscription plans / packages
        plans_data = [
            {
                'name': 'Starter Plan',
                'product': p_starter,
                'price': Decimal('29.00'),
                'billing_frequency': 'monthly',
                'min_quantity': 1,
                'allow_pause': True,
                'allow_renewal': True,
                'allow_early_close': True,
            },
            {
                'name': 'Professional Plan',
                'product': p_pro,
                'price': Decimal('79.00'),
                'billing_frequency': 'monthly',
                'min_quantity': 1,
                'allow_pause': True,
                'allow_renewal': True,
                'allow_early_close': True,
            },
            {
                'name': 'Enterprise Plan',
                'product': p_enterprise,
                'price': Decimal('199.00'),
                'billing_frequency': 'monthly',
                'min_quantity': 1,
                'allow_pause': True,
                'allow_renewal': True,
                'allow_early_close': True,
            },
            {
                'name': 'Annual Growth Pack',
                'product': p_pro,
                'price': Decimal('790.00'),
                'billing_frequency': 'yearly',
                'min_quantity': 1,
                'allow_pause': True,
                'allow_renewal': True,
                'allow_early_close': True,
            },
        ]

        created_count = 0
        for pdata in plans_data:
            plan, created = SubscriptionPlan.objects.get_or_create(
                name=pdata['name'],
                defaults={
                    'product': pdata['product'],
                    'price': pdata['price'],
                    'billing_frequency': pdata['billing_frequency'],
                    'min_quantity': pdata['min_quantity'],
                    'availability_start': date.today(),
                    'allow_pause': pdata['allow_pause'],
                    'allow_renewal': pdata['allow_renewal'],
                    'allow_early_close': pdata['allow_early_close'],
                    'is_active': True,
                }
            )
            if created:
                created_count += 1
                self.stdout.write(f"Created package: {plan.name} (${plan.price}/{plan.billing_frequency})")
            else:
                self.stdout.write(f"Existing package: {plan.name}")

        self.stdout.write(self.style.SUCCESS(f"Successfully configured packages (new: {created_count})."))

