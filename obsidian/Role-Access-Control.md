# Role-Based Access Control (RBAC)

The system enforces three user roles:

## 1. Administrator (`admin`)
- Has unrestricted control over the entire system.
- Exclusively manages:
  - Staff user registration (`/staff`)
  - Discount rule configuration (`/discounts`)
  - Tax rules configuration (`/tax-rules`)
  - Product creation and variant setup (`/products`)
  - Subscription plan definitions (`/plans`)
- Has full access to billing batches, payments, customer lists, and financial reporting.

## 2. Staff Member (`staff`)
- Operates daily business workflows.
- Permissions:
  - View customer accounts and contact information
  - Create and manage sales quotations
  - Control subscription state transitions (Activate, Pause, Resume, Close, Renew)
  - Generate and inspect invoices
  - Record payments against invoices
  - Access executive dashboard metrics
- Restrictions:
  - Cannot add or modify staff accounts
  - Cannot create or modify discount rules
  - Cannot alter global tax rules

## 3. Customer (`customer`)
- Operates through an isolated self-service customer portal.
- Permissions:
  - Self-register and manage personal profile
  - View own subscriptions (`/my-subscriptions`)
  - View and print own invoices (`/my-invoices`)
  - Review payments recorded against own account (`/my-payments`)
- Data Isolation:
  - Queries are automatically filtered by `customer = request.user`.
  - Attempts to view another customer's invoice or subscription return HTTP 404 or 403.
