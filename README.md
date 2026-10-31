# Subscription Management System

A unified recurring billing and subscription management platform running products, plans, automated invoicing, customer checkout, multi-method payments, tax calculations, and real-time revenue reporting.

---

## Key Features

1. **Authentication & Multi-Role Access Control**:
   - Role-segregated access for Administrator, Staff, and Customer users.
   - Strict password security validation (min 8 characters, uppercase, lowercase, special character).
   - One-click Google Sign-In and automated self-registration.
   - Dedicated password reset request and token verification flows.
2. **10 Dedicated Dummy Subscriptions**:
   - 10 distinct, pre-configured software subscription packages for customer self-checkout.
   - Automated plan line item calculation, billing cycles (monthly and yearly), and immediate activation.
3. **Instant Self-Checkout & Payment Settlement**:
   - Interactive payment simulation supporting Credit Card, Bank Transfer, and Net Banking.
   - Immediate invoice generation and automated payment matching.
4. **Official Receipt Generation**:
   - Printable and downloadable PDF/official receipts with unique reference numbers and paid stamps.
5. **Recurring Billing Engine**:
   - Automated batch invoicing with duplicate-billing prevention and tax calculations.
6. **Product Catalog & Variant Rules**:
   - Software products with cost, sales price, and brand variant adjustments (e.g. Odoo brand +$560.00).
7. **Quotations & Lifecycle Management**:
   - Quotation templates with validity windows and one-click conversion to confirmed subscriptions.
   - Full lifecycle management: Draft -> Quotation -> Confirmed -> Active -> Paused -> Closed -> Renewed.
8. **Discounts & Automated Tax Rules**:
   - Percentage and fixed-amount discount rules with quantity thresholds and usage limits.
   - Automated tax rules (VAT, Sales Tax, Zero-rate export).
9. **Executive Finance Dashboard & Dark Bento Theme**:
   - Real-time revenue tracking, active subscription counts, outstanding balances, and overdue invoices.
   - Responsive Pro Dark Bento UI with tabular figures and zero visual clutter.

---

## Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js v18+
- Git

---

### 2. Running Backend (Django)

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py seed_10_packages
python manage.py runserver 0.0.0.0:8000
```

API Base: http://localhost:8000/api/v1/

---

### 3. Running Frontend (React)

```powershell
cd frontend
npm run dev
```

Application URL: http://localhost:5173

---

## Seeded User Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | admin@brightloop.com | Admin@123 |
| **Internal Staff** | sarah.staff@brightloop.com | Staff@123 |
| **Customer** | acme@corp.com | Customer@123 |

*(Google Sign-In is also available for any customer account)*

---

## Documentation Vault

Comprehensive system documentation is maintained in the `obsidian/` folder:
- `obsidian/System-Overview.md`
- `obsidian/Data-Models.md`
- `obsidian/API-Reference.md`
- `obsidian/Role-Access-Control.md`
- `obsidian/Billing-Engine.md`
- `obsidian/Changelog.md`
