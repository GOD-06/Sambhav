from datetime import date
from decimal import Decimal
from django.core.management.base import BaseCommand
from products.models import Product, SubscriptionPlan


class Command(BaseCommand):
    help = 'Seed 10 distinct dummy subscription packages for customers to buy'

    def handle(self, *args, **options):
        # 10 Products with descriptions and realistic price points
        products_data = [
            {
                'name': 'Cloud Core Engine',
                'product_type': 'Software',
                'sales_price': Decimal('19.00'),
                'cost_price': Decimal('3.50'),
                'notes': 'Entry-level containerized cloud core for developers and micro-services.',
            },
            {
                'name': 'DevTooling Platform',
                'product_type': 'Software',
                'sales_price': Decimal('29.00'),
                'cost_price': Decimal('5.00'),
                'notes': 'Developer IDE extensions, CI/CD automated test pipelines, and sandbox environments.',
            },
            {
                'name': 'Team Workspace Matrix',
                'product_type': 'Software',
                'sales_price': Decimal('39.00'),
                'cost_price': Decimal('7.00'),
                'notes': 'Collaborative real-time docs, agile project tracking boards, and chat integrations.',
            },
            {
                'name': 'Business Automation Suite',
                'product_type': 'Software',
                'sales_price': Decimal('49.00'),
                'cost_price': Decimal('9.00'),
                'notes': 'Workflow automation triggers, customer data synchronization, and billing webhooks.',
            },
            {
                'name': 'Cognitive Analytics Engine',
                'product_type': 'Software',
                'sales_price': Decimal('79.00'),
                'cost_price': Decimal('15.00'),
                'notes': 'Predictive revenue forecasting, customer churn scoring, and real-time dashboard KPIs.',
            },
            {
                'name': 'Enterprise Architecture',
                'product_type': 'Software',
                'sales_price': Decimal('99.00'),
                'cost_price': Decimal('18.00'),
                'notes': 'Dedicated cluster compute, audit logging, role-based controls, and SOC2 compliance.',
            },
            {
                'name': 'CyberShield Sentinel',
                'product_type': 'Software',
                'sales_price': Decimal('119.00'),
                'cost_price': Decimal('22.00'),
                'notes': 'Real-time threat monitoring, vulnerability scanning, and automated DDoS defense.',
            },
            {
                'name': 'Cloud Connect Gateway',
                'product_type': 'Software',
                'sales_price': Decimal('149.00'),
                'cost_price': Decimal('28.00'),
                'notes': 'High-throughput API gateway with traffic shaping, rate-limiting, and geo-routing.',
            },
            {
                'name': 'Executive Suite',
                'product_type': 'Software',
                'sales_price': Decimal('490.00'),
                'cost_price': Decimal('60.00'),
                'notes': 'All-in-one annual corporate licensing, priority architect support, and custom SLAs.',
            },
            {
                'name': 'Global Multi-Region Cluster',
                'product_type': 'Software',
                'sales_price': Decimal('990.00'),
                'cost_price': Decimal('120.00'),
                'notes': 'Worldwide edge deployment across 28 global regions with 99.999% uptime guarantee.',
            },
        ]

        products = {}
        for p_data in products_data:
            p, _ = Product.objects.update_or_create(
                name=p_data['name'],
                defaults=p_data,
            )
            products[p.name] = p

        # 10 Subscription Plans linked to each product
        plans_data = [
            {
                'name': 'Starter Cloud Essentials',
                'product': products['Cloud Core Engine'],
                'price': Decimal('19.00'),
                'billing_frequency': 'monthly',
                'min_quantity': 1,
                'allow_pause': True,
                'allow_renewal': True,
                'allow_early_close': True,
            },
            {
                'name': 'Developer Pro Sandbox',
                'product': products['DevTooling Platform'],
                'price': Decimal('29.00'),
                'billing_frequency': 'monthly',
                'min_quantity': 1,
                'allow_pause': True,
                'allow_renewal': True,
                'allow_early_close': True,
            },
            {
                'name': 'Team Collaboration Plus',
                'product': products['Team Workspace Matrix'],
                'price': Decimal('39.00'),
                'billing_frequency': 'monthly',
                'min_quantity': 1,
                'allow_pause': True,
                'allow_renewal': True,
                'allow_early_close': True,
            },
            {
                'name': 'Professional Suite',
                'product': products['Business Automation Suite'],
                'price': Decimal('49.00'),
                'billing_frequency': 'monthly',
                'min_quantity': 1,
                'allow_pause': True,
                'allow_renewal': True,
                'allow_early_close': True,
            },
            {
                'name': 'AI Analytics Intelligence',
                'product': products['Cognitive Analytics Engine'],
                'price': Decimal('79.00'),
                'billing_frequency': 'monthly',
                'min_quantity': 1,
                'allow_pause': True,
                'allow_renewal': True,
                'allow_early_close': True,
            },
            {
                'name': 'Enterprise Growth Tier',
                'product': products['Enterprise Architecture'],
                'price': Decimal('99.00'),
                'billing_frequency': 'monthly',
                'min_quantity': 1,
                'allow_pause': True,
                'allow_renewal': True,
                'allow_early_close': True,
            },
            {
                'name': 'CyberShield Sentinel',
                'product': products['CyberShield Sentinel'],
                'price': Decimal('119.00'),
                'billing_frequency': 'monthly',
                'min_quantity': 1,
                'allow_pause': True,
                'allow_renewal': True,
                'allow_early_close': True,
            },
            {
                'name': 'High-Frequency API Gateway',
                'product': products['Cloud Connect Gateway'],
                'price': Decimal('149.00'),
                'billing_frequency': 'monthly',
                'min_quantity': 1,
                'allow_pause': True,
                'allow_renewal': True,
                'allow_early_close': True,
            },
            {
                'name': 'Annual Founder Executive',
                'product': products['Executive Suite'],
                'price': Decimal('490.00'),
                'billing_frequency': 'yearly',
                'min_quantity': 1,
                'allow_pause': True,
                'allow_renewal': True,
                'allow_early_close': True,
            },
            {
                'name': 'Global Scale Enterprise Max',
                'product': products['Global Multi-Region Cluster'],
                'price': Decimal('990.00'),
                'billing_frequency': 'yearly',
                'min_quantity': 1,
                'allow_pause': True,
                'allow_renewal': True,
                'allow_early_close': True,
            },
        ]

        # Deactivate old temporary plans that are not in the 10
        plan_names = [p['name'] for p in plans_data]
        SubscriptionPlan.objects.exclude(name__in=plan_names).update(is_active=False)

        today = date.today()
        for p_info in plans_data:
            SubscriptionPlan.objects.update_or_create(
                name=p_info['name'],
                defaults={
                    'product': p_info['product'],
                    'price': p_info['price'],
                    'billing_frequency': p_info['billing_frequency'],
                    'min_quantity': p_info['min_quantity'],
                    'availability_start': today,
                    'allow_pause': p_info['allow_pause'],
                    'allow_renewal': p_info['allow_renewal'],
                    'allow_early_close': p_info['allow_early_close'],
                    'is_active': True,
                }
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(plans_data)} active subscription packages.'))

