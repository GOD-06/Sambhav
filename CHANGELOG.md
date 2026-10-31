# Brightloop Project Change Log

## [1.0.0] - 2026-10-31

### Initial Release - Full Subscription Management System

#### Problem Solved
Brightloop's manual spreadsheet tracking, missed renewals, manual invoice drafting, payment mismatching, and delayed finance reporting needed to be replaced with a single automated, role-based platform.

#### Purpose
Deliver a complete, production-grade Subscription Management System covering the entire subscription lifecycle: customer onboarding, catalog with variants, quotations, subscriptions, automated recurring billing, discount rules, payments reconciliation, and executive dashboards.

#### Files Created & Configured
1. **Backend (Django & DRF)**:
   - `accounts/`: User model extending `AbstractUser`, role-based permissions (`IsAdmin`, `IsStaffUser`, `IsOwnerOrStaff`), registration with password validation, JWT authentication, and staff provisioning.
   - `products/`: `Product`, `ProductVariant` (with configurable price adjustments e.g. Odoo +$560), and `SubscriptionPlan` with lifecycle rules.
   - `subscriptions/`: `Quotation`, `QuotationLine`, `QuotationTemplate`, `Subscription`, `SubscriptionLine` with quotation accept action and full subscription lifecycle transitions (activate, pause, resume, close, renew).
   - `invoices/`: `Invoice`, `InvoiceLine`, `TaxRule`, and batch invoice generation with duplicate-billing prevention.
   - `payments/`: `Payment` tracking with automatic invoice status updates upon full payment.
   - `discounts/`: `DiscountRule` with fixed/percentage logic, eligibility checks, and usage limits.
   - `dashboard/`: `DashboardStatsView` providing active subscription count, total revenue, outstanding balances, overdue lists, and monthly revenue chart data.
   - Management Commands: `seed_data` (populates demo accounts and records) and `generate_invoices` (CLI billing batch).
2. **Frontend (React, Vite, Tailwind CSS)**:
   - Auth: `Login.jsx`, `Register.jsx`, `AuthContext.jsx`, route protectors (`ProtectedRoute`, `RoleRoute`).
   - Admin/Staff: `Dashboard.jsx`, `Customers.jsx`, `Products.jsx`, `Plans.jsx`, `Quotations.jsx`, `Subscriptions.jsx`, `Invoices.jsx`, `Payments.jsx`, `Discounts.jsx`, `TaxRules.jsx`, `Staff.jsx`, `Settings.jsx`.
   - Customer Portal: `MySubscriptions.jsx`, `MyInvoices.jsx`, `MyPayments.jsx`.
   - Components & Layout: `Layout.jsx`, `Sidebar.jsx`, `TopBar.jsx`, `DataTable.jsx`, `StatCard.jsx`, `StatusBadge.jsx`, `Modal.jsx`, `FormField.jsx`, `PageHeader.jsx`.

#### Verification & Testing
- Database migrations successfully applied across all 7 apps.
- `seed_data` command executed and verified.
- `generate_invoices` command executed and successfully produced recurring billing with duplicate checks.
- Frontend production build (`npm run build`) compiled cleanly in 7.53s with 0 errors.

