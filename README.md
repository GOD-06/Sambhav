# Brightloop Subscription Management System

A full-stack enterprise **Subscription Management System** designed for **Brightloop Software Inc.** to manage customer accounts, product catalogs, priced variants, recurring billing schedules, quotations, invoices, payments, tax calculations, and discount rules.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python**: 3.10+ (tested on Python 3.13)
- **Node.js**: v18+ (tested on Node v24)
- **Git**

---

### 2. Running the Backend (Django + DRF)

Open a terminal in the project directory:

```powershell
# Navigate to backend
cd backend

# Activate Virtual Environment (Windows)
.\venv\Scripts\Activate.ps1

# (Optional) If starting fresh, run migrations & seed data:
python manage.py migrate
python manage.py seed_data

# Start the Django development server (Runs at http://localhost:8000)
python manage.py runserver 8000
```

---

### 3. Running the Frontend (React + Vite + Tailwind CSS)

Open a second terminal in the project directory:

```powershell
# Navigate to frontend
cd frontend

# Start the Vite development server (Runs at http://localhost:5173)
npm run dev
```

Open your browser to: **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Default Seed Demo Accounts

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@brightloop.com` | `Admin@123` | Full control: Products, Plans, Taxes, Discounts, Staff, Subscriptions, Invoices, Payments, Dashboard |
| **Staff Member** | `sarah.staff@brightloop.com` | `Staff@123` | Day-to-day operations: Customers, Quotations, Subscriptions lifecycle, Invoices, Payments, Dashboard |
| **Customer** | `acme.corp@example.com` | `Customer@123` | Customer Portal: Only sees own subscriptions, invoices, and payments |
| **Customer** | `techflow.io@example.com` | `Customer@123` | Customer Portal: TechFlow Solutions |
| **Customer** | `starlight.retail@example.com` | `Customer@123` | Customer Portal: Starlight Retail |

---

## 📦 Implemented Functional Modules

### 1. Customer Registration & Access Control (RBAC)
- Self-registration with strict password policy (minimum 8 chars, uppercase, lowercase, special character).
- Three role tiers: **Admin**, **Staff**, and **Customer**.
- Admin-exclusive staff account creation (`/staff`).
- Customer data isolation: Customers can never see other customers' subscriptions, invoices, or payments.

### 2. Products & Configurable Variants
- Product creation: Name, Type, Sales Price, Cost Price, and Notes.
- Dynamic variants with price adjustments (e.g. *Odoo Enterprise Brand Integration* with configurable `+$560.00`).
- Variant pricing reflects automatically in Quotations and Invoices.

### 3. Subscription Plans
- Billing cadences: **Daily**, **Weekly**, **Monthly**, and **Yearly**.
- Plan lifecycle controls: `allow_pause`, `allow_renewal`, `allow_early_close`, and `auto_close_on_end`.
- Configurable minimum order quantities.

### 4. Quotations & Subscriptions Lifecycle
- Quotation drafting with itemized lines, quantity, unit price, and tax rate calculation.
- **One-click Quotation Acceptance**: Automatically transitions to a Confirmed Subscription with copied line items.
- Subscription status state machine: `Draft` ➔ `Confirmed` ➔ `Active` ➔ `Paused` ➔ `Closed`.
- Action controls: Activate, Pause, Resume, Close, and Renew.

### 5. Invoicing & Batch Recurring Billing
- Auto-generation of recurring invoices from active subscriptions.
- **Duplicate-Billing Protection**: Prevents double-billing active subscriptions for overlapping billing periods.
- Invoice actions: Confirm, Send, Cancel, and Print/Download receipt.
- One-click **Batch Billing Run** via API or CLI (`python manage.py generate_invoices`).

### 6. Discounts & Promotions
- Admin-created discount rules: Fixed dollar amounts or percentage discounts.
- Eligibility rules: minimum purchase amounts, validity date ranges, usage limits, and application scope (whole subscription vs line item).

### 7. Payments & Reconciliation
- Multiple payment methods: Bank Transfer, Credit Card, Cash, Cheque, and Other.
- Auto-reconciliation: Automatically sets invoice status to `Paid` when cumulative recorded payments equal or exceed invoice total.
- Tracking of balance due and overdue invoices.

### 8. Executive Dashboard & Real-Time Reporting
- Key metrics: Active Subscriptions Count, Total Revenue Received, Total Outstanding Amount, Overdue Invoices Count.
- Interactive Revenue Trend Area Chart (powered by Recharts).
- Immediate list of overdue invoices with customer and amount owed for rapid follow-up.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS v4, Lucide Icons, Recharts, Axios, React Hot Toast
- **Backend**: Python 3.13, Django 4.2 LTS, Django REST Framework, SimpleJWT (JWT Authentication), django-cors-headers, django-filter
- **Database**: SQLite (Ready for PostgreSQL migration)
