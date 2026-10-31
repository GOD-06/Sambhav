from datetime import date, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import Product, ProductVariant, SubscriptionPlan
from subscriptions.models import QuotationTemplate, Quotation, QuotationLine, Subscription, SubscriptionLine
from invoices.models import TaxRule, Invoice, InvoiceLine
from discounts.models import DiscountRule
from payments.models import Payment

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds initial demo data for Brightloop Subscription Management System'

    def handle(self, *args, **options):
        self.stdout.write("Starting database seeding...")

        # 1. Users
        admin_user, _ = User.objects.get_or_create(
            email='admin@brightloop.com',
            defaults={
                'first_name': 'Super',
                'last_name': 'Admin',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('Admin@123')
        admin_user.save()

        staff1, _ = User.objects.get_or_create(
            email='sarah.staff@brightloop.com',
            defaults={
                'first_name': 'Sarah',
                'last_name': 'Connor',
                'role': 'staff',
                'is_staff': True,
            }
        )
        staff1.set_password('Staff@123')
        staff1.save()

        staff2, _ = User.objects.get_or_create(
            email='alex.staff@brightloop.com',
            defaults={
                'first_name': 'Alex',
                'last_name': 'Murphy',
                'role': 'staff',
                'is_staff': True,
            }
        )
        staff2.set_password('Staff@123')
        staff2.save()

        cust1, _ = User.objects.get_or_create(
            email='acme.corp@example.com',
            defaults={
                'first_name': 'John',
                'last_name': 'Acme',
                'role': 'customer',
                'company_name': 'Acme Corporation',
                'phone': '+1 (555) 123-4567',
            }
        )
        cust1.set_password('Customer@123')
        cust1.save()

        cust2, _ = User.objects.get_or_create(
            email='techflow.io@example.com',
            defaults={
                'first_name': 'Elena',
                'last_name': 'Rostova',
                'role': 'customer',
                'company_name': 'TechFlow Solutions',
                'phone': '+1 (555) 234-5678',
            }
        )
        cust2.set_password('Customer@123')
        cust2.save()

        cust3, _ = User.objects.get_or_create(
            email='starlight.retail@example.com',
            defaults={
                'first_name': 'David',
                'last_name': 'Kim',
                'role': 'customer',
                'company_name': 'Starlight Retail',
                'phone': '+1 (555) 345-6789',
            }
        )
        cust3.set_password('Customer@123')
        cust3.save()

        self.stdout.write(self.style.SUCCESS("Users created (Admin, Staff, Customers)"))

        # 2. Tax Rules
        tax_vat, _ = TaxRule.objects.get_or_create(
            name='VAT Standard (20%)',
            defaults={'rate': Decimal('20.00'), 'is_active': True}
        )
        tax_sales, _ = TaxRule.objects.get_or_create(
            name='US State Sales Tax (8.5%)',
            defaults={'rate': Decimal('8.50'), 'is_active': True}
        )

        # 3. Products and Variants
        p_erp, _ = Product.objects.get_or_create(
            name='Brightloop Cloud ERP',
            defaults={
                'product_type': 'Software',
                'sales_price': Decimal('499.00'),
                'cost_price': Decimal('120.00'),
                'notes': 'Complete ERP system with finance, accounting, and HR.',
                'created_by': admin_user,
            }
        )
        ProductVariant.objects.get_or_create(
            product=p_erp,
            name='Standard Edition',
            defaults={'price_adjustment': Decimal('0.00')}
        )
        ProductVariant.objects.get_or_create(
            product=p_erp,
            name='Odoo Enterprise Brand Integration',
            defaults={'price_adjustment': Decimal('560.00')}
        )

        p_crm, _ = Product.objects.get_or_create(
            name='Brightloop CRM Suite',
            defaults={
                'product_type': 'Software',
                'sales_price': Decimal('199.00'),
                'cost_price': Decimal('45.00'),
                'notes': 'Sales pipeline, leads tracking, and contact management.',
                'created_by': admin_user,
            }
        )
        ProductVariant.objects.get_or_create(
            product=p_crm,
            name='Starter (up to 5 seats)',
            defaults={'price_adjustment': Decimal('0.00')}
        )
        ProductVariant.objects.get_or_create(
            product=p_crm,
            name='Pro (Unlimited seats)',
            defaults={'price_adjustment': Decimal('150.00')}
        )

        p_inv, _ = Product.objects.get_or_create(
            name='Inventory & Warehouse Manager',
            defaults={
                'product_type': 'Software',
                'sales_price': Decimal('249.00'),
                'cost_price': Decimal('50.00'),
                'notes': 'Multi-warehouse stock tracking and barcode scanning.',
                'created_by': admin_user,
            }
        )

        p_analytics, _ = Product.objects.get_or_create(
            name='BI Analytics & Insights Pro',
            defaults={
                'product_type': 'Add-on',
                'sales_price': Decimal('149.00'),
                'cost_price': Decimal('30.00'),
                'notes': 'Real-time dashboards, executive summaries, predictive forecasting.',
                'created_by': admin_user,
            }
        )

        p_chat, _ = Product.objects.get_or_create(
            name='Brightloop Team Collaboration',
            defaults={
                'product_type': 'Software',
                'sales_price': Decimal('79.00'),
                'cost_price': Decimal('15.00'),
                'notes': 'Internal messaging, file sharing, video conferencing.',
                'created_by': admin_user,
            }
        )

        self.stdout.write(self.style.SUCCESS("Products and variants created"))

        # 4. Subscription Plans
        plan_starter, _ = SubscriptionPlan.objects.get_or_create(
            name='Starter Monthly',
            defaults={
                'price': Decimal('199.00'),
                'billing_frequency': 'monthly',
                'min_quantity': 1,
                'availability_start': date(2026, 1, 1),
                'allow_early_close': True,
                'allow_pause': True,
                'allow_renewal': True,
            }
        )

        plan_growth, _ = SubscriptionPlan.objects.get_or_create(
            name='Growth Business Monthly',
            defaults={
                'price': Decimal('499.00'),
                'billing_frequency': 'monthly',
                'min_quantity': 1,
                'availability_start': date(2026, 1, 1),
                'allow_early_close': True,
                'allow_pause': True,
                'allow_renewal': True,
            }
        )

        plan_enterprise, _ = SubscriptionPlan.objects.get_or_create(
            name='Enterprise Annual Suite',
            defaults={
                'price': Decimal('4999.00'),
                'billing_frequency': 'yearly',
                'min_quantity': 1,
                'availability_start': date(2026, 1, 1),
                'allow_early_close': False,
                'allow_pause': False,
                'allow_renewal': True,
            }
        )

        self.stdout.write(self.style.SUCCESS("Subscription plans created"))

        # 5. Discount Rules
        d1, _ = DiscountRule.objects.get_or_create(
            name='Q4 Early Bird Special 15%',
            defaults={
                'discount_type': 'percentage',
                'value': Decimal('15.00'),
                'start_date': date(2026, 1, 1),
                'end_date': date(2026, 12, 31),
                'usage_limit': 100,
                'apply_to_whole_subscription': True,
                'created_by': admin_user,
            }
        )

        d2, _ = DiscountRule.objects.get_or_create(
            name='Enterprise High-Value Deal $200 OFF',
            defaults={
                'discount_type': 'fixed',
                'value': Decimal('200.00'),
                'min_purchase_amount': Decimal('1000.00'),
                'start_date': date(2026, 1, 1),
                'usage_limit': 50,
                'apply_to_whole_subscription': True,
                'created_by': admin_user,
            }
        )

        # 6. Quotation Templates & Quotations
        q_template, _ = QuotationTemplate.objects.get_or_create(
            name='Standard Enterprise Proposal',
            defaults={
                'plan': plan_growth,
                'validity_days': 30,
                'notes': 'Default proposal template for medium enterprises.',
                'created_by': staff1,
            }
        )

        q1, _ = Quotation.objects.get_or_create(
            customer=cust1,
            plan=plan_growth,
            defaults={
                'valid_until': date.today() + timedelta(days=25),
                'status': 'accepted',
                'notes': 'Accepted proposal for full suite.',
                'created_by': staff1,
            }
        )
        if not q1.lines.exists():
            QuotationLine.objects.create(
                quotation=q1,
                product=p_erp,
                quantity=1,
                unit_price=p_erp.sales_price,
                tax_rate=Decimal('20.00'),
            )
            QuotationLine.objects.create(
                quotation=q1,
                product=p_analytics,
                quantity=2,
                unit_price=p_analytics.sales_price,
                tax_rate=Decimal('20.00'),
            )

        q2, _ = Quotation.objects.get_or_create(
            customer=cust2,
            plan=plan_starter,
            defaults={
                'valid_until': date.today() + timedelta(days=15),
                'status': 'sent',
                'notes': 'Starter pack proposal under review.',
                'created_by': staff2,
            }
        )
        if not q2.lines.exists():
            QuotationLine.objects.create(
                quotation=q2,
                product=p_crm,
                quantity=1,
                unit_price=p_crm.sales_price,
                tax_rate=Decimal('8.50'),
            )

        # 7. Subscriptions
        today = date.today()
        sub1, _ = Subscription.objects.get_or_create(
            customer=cust1,
            plan=plan_growth,
            defaults={
                'quotation': q1,
                'start_date': today - timedelta(days=60),
                'next_billing_date': today + timedelta(days=30),
                'payment_terms': 'Net 30',
                'status': 'active',
                'created_by': staff1,
            }
        )
        if not sub1.lines.exists():
            SubscriptionLine.objects.create(
                subscription=sub1,
                product=p_erp,
                quantity=1,
                unit_price=p_erp.sales_price,
                tax_rate=Decimal('20.00'),
            )
            SubscriptionLine.objects.create(
                subscription=sub1,
                product=p_analytics,
                quantity=2,
                unit_price=p_analytics.sales_price,
                tax_rate=Decimal('20.00'),
            )

        sub2, _ = Subscription.objects.get_or_create(
            customer=cust3,
            plan=plan_starter,
            defaults={
                'start_date': today - timedelta(days=45),
                'next_billing_date': today - timedelta(days=5),  # Due now!
                'payment_terms': 'Due Upon Receipt',
                'status': 'active',
                'created_by': staff2,
            }
        )
        if not sub2.lines.exists():
            SubscriptionLine.objects.create(
                subscription=sub2,
                product=p_inv,
                quantity=1,
                unit_price=p_inv.sales_price,
                tax_rate=Decimal('8.50'),
            )

        sub3, _ = Subscription.objects.get_or_create(
            customer=cust2,
            plan=plan_enterprise,
            defaults={
                'start_date': today - timedelta(days=10),
                'next_billing_date': today + timedelta(days=355),
                'payment_terms': 'Net 30',
                'status': 'confirmed',
                'created_by': admin_user,
            }
        )
        if not sub3.lines.exists():
            SubscriptionLine.objects.create(
                subscription=sub3,
                product=p_erp,
                quantity=1,
                unit_price=Decimal('4999.00'),
                tax_rate=Decimal('20.00'),
            )

        self.stdout.write(self.style.SUCCESS("Subscriptions created"))

        # 8. Invoices and Payments
        # Paid invoice for sub1
        inv1, _ = Invoice.objects.get_or_create(
            subscription=sub1,
            customer=cust1,
            issue_date=today - timedelta(days=60),
            defaults={
                'due_date': today - timedelta(days=30),
                'status': 'paid',
                'billing_period_start': today - timedelta(days=60),
                'billing_period_end': today - timedelta(days=31),
                'notes': 'First month subscription invoice',
            }
        )
        if not inv1.lines.exists():
            InvoiceLine.objects.create(
                invoice=inv1,
                product=p_erp,
                description='Brightloop Cloud ERP',
                quantity=1,
                unit_price=p_erp.sales_price,
                tax_rate=Decimal('20.00'),
            )
            InvoiceLine.objects.create(
                invoice=inv1,
                product=p_analytics,
                description='BI Analytics & Insights Pro',
                quantity=2,
                unit_price=p_analytics.sales_price,
                tax_rate=Decimal('20.00'),
            )
            inv1.calculate_totals()

        # Payment for inv1
        Payment.objects.get_or_create(
            invoice=inv1,
            amount=inv1.total,
            defaults={
                'payment_method': 'bank_transfer',
                'payment_date': today - timedelta(days=35),
                'note': 'Wire transfer confirmed ref: WT-9921',
                'created_by': staff1,
            }
        )

        # Overdue invoice for sub2
        inv2, _ = Invoice.objects.get_or_create(
            subscription=sub2,
            customer=cust3,
            issue_date=today - timedelta(days=45),
            defaults={
                'due_date': today - timedelta(days=15),
                'status': 'sent',
                'billing_period_start': today - timedelta(days=45),
                'billing_period_end': today - timedelta(days=16),
                'notes': 'Overdue invoice - payment reminder sent',
            }
        )
        if not inv2.lines.exists():
            InvoiceLine.objects.create(
                invoice=inv2,
                product=p_inv,
                description='Inventory & Warehouse Manager',
                quantity=1,
                unit_price=p_inv.sales_price,
                tax_rate=Decimal('8.50'),
            )
            inv2.calculate_totals()

        # Partial payment for inv2
        Payment.objects.get_or_create(
            invoice=inv2,
            amount=Decimal('100.00'),
            defaults={
                'payment_method': 'credit_card',
                'payment_date': today - timedelta(days=10),
                'note': 'Partial payment received',
                'created_by': staff2,
            }
        )

        self.stdout.write(self.style.SUCCESS("Invoices and payments seeded successfully!"))
        self.stdout.write(self.style.SUCCESS("Default credentials:"))
        self.stdout.write("  Admin: admin@brightloop.com / Admin@123")
        self.stdout.write("  Staff: sarah.staff@brightloop.com / Staff@123")
        self.stdout.write("  Customer: acme.corp@example.com / Customer@123")
