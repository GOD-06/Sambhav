# Data Models and Relational Architecture

## User Model (`accounts.User`)
Extends `AbstractUser` with email-based authentication:
- `email`: Unique identifier (used for login)
- `role`: Choices (`admin`, `staff`, `customer`)
- `company_name`: Optional string for corporate clients
- `phone`: Optional contact number

## Catalog Models (`products`)

### Product
- `name`: Product name
- `product_type`: Categorization (Software, Add-on, Service)
- `sales_price`: Base price (Decimal)
- `cost_price`: Internal unit cost (Decimal)
- `notes`: Description and deployment notes
- `is_active`: Boolean flag

### ProductVariant
- `product`: Foreign key to `Product`
- `name`: Variant title (e.g., Odoo Integration, Enterprise Tier)
- `price_adjustment`: Decimal adjustment added to base sales price (can be positive or negative)
- `is_active`: Boolean flag

### SubscriptionPlan
- `name`: Plan name
- `product`: Optional foreign key to primary `Product`
- `price`: Plan base recurring rate
- `billing_frequency`: daily, weekly, monthly, or yearly
- `min_quantity`: Minimum purchase quantity
- `availability_start` / `availability_end`: Validity range
- Lifecycle flags: `allow_pause`, `allow_renewal`, `allow_early_close`, `auto_close_on_end`

## Sales and Subscription Models (`subscriptions`)

### Quotation
- `quotation_number`: Unique identifier formatted as `QT-XXXXX`
- `customer`: Foreign key to `User` (role = customer)
- `plan`: Foreign key to `SubscriptionPlan`
- `status`: draft, sent, accepted, rejected, expired
- `valid_until`: Expiration date
- Lines relationship to `QuotationLine`

### Subscription
- `subscription_number`: Unique identifier formatted as `SUB-XXXXX`
- `customer`: Foreign key to `User`
- `plan`: Foreign key to `SubscriptionPlan`
- `quotation`: Optional link to originating quote
- `status`: draft, quotation, confirmed, active, paused, closed
- `start_date`: Commencement date
- `end_date`: Expiry or closure date
- `next_billing_date`: Date next invoice must be generated
- `payment_terms`: Payment agreement (e.g., Net 30)

## Billing Models (`invoices` and `payments`)

### TaxRule
- `name`: Tax identification (e.g., VAT 20%)
- `rate`: Decimal percentage

### Invoice
- `invoice_number`: Unique identifier formatted as `INV-XXXXX`
- `subscription`: Optional link to parent `Subscription`
- `customer`: Foreign key to `User`
- `issue_date` / `due_date`: Dates
- `status`: draft, confirmed, sent, paid, cancelled
- `subtotal`, `tax_total`, `discount_total`, `total`: Monetary amounts
- `billing_period_start` / `billing_period_end`: Period dates used to block duplicate billing

### Payment
- `invoice`: Foreign key to `Invoice`
- `payment_method`: bank_transfer, credit_card, cash, cheque, other
- `amount`: Decimal payment amount
- `payment_date`: Date received
- `note`: Bank reference or transaction code

