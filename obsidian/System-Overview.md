# Brightloop Subscription Management System

## Overview
Brightloop Software provides subscription-based software packages. This platform manages customer accounts, access levels, catalog definitions, variant pricing, sales quotations, recurring billing cycles, invoices, tax calculations, discounts, and payments.

## Architecture
- **Backend**: Django 4.2 LTS, Django REST Framework, SimpleJWT
- **Frontend**: React 18, Vite 6, Tailwind CSS v4, Lucide Icons, Recharts
- **Database**: SQLite (relational schema configured for future PostgreSQL migration)
- **API Convention**: RESTful JSON endpoints under `/api/v1/`

## Key Capabilities
- **Customer Portal**: Dedicated self-service area where authenticated customers view only their own subscriptions and invoices.
- **Product and Variant Engine**: Configurable price adjustments for editions and add-on packs.
- **Recurring Lifecycle Machine**: Subscription transitions across Draft, Confirmed, Active, Paused, and Closed states.
- **Billing Engine**: Batch recurring invoice generator with duplicate-billing prevention.
- **Payment Reconciliation**: Automatic invoice status update to Paid when total payments reach or exceed the invoice amount.

