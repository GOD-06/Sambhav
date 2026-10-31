# Brightloop Subscription Management System
## Project Guide, Requirements, Architecture and Development Plan

**Document status:** Completed v1.0  
**Created:** 2026-10-31  
**Project brief:** `Subscription_Management_System.pdf`  
**Change log:** `CHANGELOG.md`

---

# 1. What are we building?

We are building a **Subscription Management System** for **Brightloop Software**.
Brightloop sells software through subscriptions. Customers pay monthly or yearly, purchase add-ons, or select products with different variants.

Our application manages the entire business process around those subscriptions:
- Customer accounts and access permissions
- Products, product variants and subscription plans
- Quotations and subscriptions
- Recurring invoices and taxes
- Discounts
- Payments and reconciliation
- Revenue and overdue-invoice reporting

---

# 2. Implemented Architecture

- **Backend:** Django 4.2 + Django REST Framework + SimpleJWT Authentication
- **Database:** SQLite (configured with migration path to PostgreSQL)
- **Frontend:** React 18 + Vite 6 + Tailwind CSS v4 + Lucide Icons + Recharts
- **API Style:** RESTful JSON endpoints under `/api/v1/`

---

# 3. Functional Requirements Checklist

## 5.1 Customer registration and access
- [x] Customer can register using an email address and password.
- [x] Each email address can belong to only one account.
- [x] Password must be more than eight characters.
- [x] Password must contain an uppercase letter.
- [x] Password must contain a lowercase letter.
- [x] Password must contain a special character.
- [x] Admin, staff and customers have different access roles.
- [x] Admin controls the whole system.
- [x] Staff have limited access for daily work.
- [x] Customers can see only their own subscriptions and invoices.
- [x] Only the admin can add a new staff member.

## 5.2 Products and variants
- [x] Admin can add products with name, type, sales price, cost price, notes.
- [x] Add and manage product variants.
- [x] Configure price adjustments for variants (e.g. Odoo brand adds $560).
- [x] Selected variant price is reflected in quotations, subscriptions, and invoices.

## 5.3 Subscription plans
- [x] Price and billing frequencies: daily, weekly, monthly, yearly.
- [x] Minimum quantity requirement.
- [x] Availability start and end dates.
- [x] Plan lifecycle settings: allow pause, allow renewal, allow early close, auto-close on end.

## 5.4 Quotation templates and subscriptions
- [x] Quotation templates with plan and product lines.
- [x] Quotation numbering (`QT-00001`) and validity dates.
- [x] Subscriptions numbering (`SUB-00001`) with next billing date.
- [x] Line items: product, variant, quantity, unit price, taxes, and totals.
- [x] One-click conversion: Accepting quotation creates confirmed subscription.
- [x] Subscription states: Draft, Quotation, Confirmed, Active, Paused, and Closed.

## 5.5 Invoices and billing
- [x] Generate invoices from subscriptions when billing is due (`INV-00001`).
- [x] Taxes calculated dynamically from admin-configured Tax Rules.
- [x] Invoice actions: Confirm, Cancel, Send, and Print.
- [x] Duplicate-billing protection prevents multiple invoices for overlapping periods.
- [x] Batch invoice generation via UI or `python manage.py generate_invoices`.

## 5.6 Discounts
- [x] Admin-only discount creation: Fixed or percentage discount.
- [x] Minimum purchase threshold and usage limits.
- [x] Date ranges and application scope.

## 5.7 Payments
- [x] Payment recording: method, amount, date, note, invoice link.
- [x] Invoices automatically marked Paid when balance reaches zero.
- [x] Outstanding and overdue balance tracking.

## 5.8 Dashboard and reporting
- [x] Active subscription count.
- [x] Total revenue received.
- [x] Outstanding amount still owed.
- [x] Overdue invoices list.
- [x] Visual revenue growth trend chart.

