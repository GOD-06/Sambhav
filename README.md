# Brightloop Subscription Management System

Subscription management platform for Brightloop Software Inc. Manages customer accounts, product catalogs, variant pricing, recurring billing intervals, quotations, subscriptions, invoices, payments, tax calculations, and discount rules.

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
python manage.py runserver 8000
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

## Initial Administrator Account

| Role | Email | Password |
| :--- | :--- | :--- |
| Administrator | admin@brightloop.com | Admin@123 |

All fabricated sample data has been removed. You can register new customers through `/register` or provision staff and catalog items through the administrator panel.

---

## Functional Modules

1. **Authentication and Access Control**: Role-based permissions across Administrator, Staff, and Customer users.
2. **Products and Variants**: Product catalog with configurable variant price adjustments.
3. **Subscription Plans**: Recurring intervals (daily, weekly, monthly, yearly) and lifecycle policies.
4. **Quotations and Subscriptions**: Quotation drafting with one-click conversion to confirmed subscriptions.
5. **Billing Engine**: Automated batch invoicing with duplicate-billing protection.
6. **Payments**: Transaction tracking with automatic invoice settlement.
7. **Discounts and Taxes**: Admin-configured discount and tax rules.
8. **Dashboard**: Metrics for active subscriptions, revenue, outstanding balances, and overdue invoices.

---

## Documentation Vault

Full system documentation is maintained in the `obsidian/` folder:
- `obsidian/System-Overview.md`
- `obsidian/Data-Models.md`
- `obsidian/API-Reference.md`
- `obsidian/Role-Access-Control.md`
- `obsidian/Billing-Engine.md`
- `obsidian/Changelog.md`
