# API Endpoints Reference

All endpoints are hosted under `/api/v1/` and accept/return JSON.

## Authentication (`/accounts/`)
- `POST /auth/login/`: Validates email and password; returns JWT access and refresh tokens.
- `POST /auth/register/`: Customer registration with strict password validation.
- `POST /auth/token/refresh/`: Obtains fresh access token via refresh token.
- `GET /accounts/profile/`: Retrieves authenticated profile.
- `PATCH /accounts/profile/`: Updates personal details.
- `POST /accounts/change-password/`: Updates password verifying previous credentials.
- `POST /auth/staff/create/`: Admin-exclusive staff user creation.

## Products & Catalog (`/products/`)
- `GET, POST /products/`: List products or create new item.
- `GET, PATCH, DELETE /products/{id}/`: Retrieve, update, or remove product.
- `GET, POST /product-variants/`: List or create variant pricing rules.
- `GET, POST /plans/`: Manage subscription tiers and billing cadences.

## Quotations & Subscriptions (`/subscriptions/`)
- `GET, POST /quotations/`: Manage quotes.
- `POST /quotations/{id}/accept/`: Accepts quote and creates confirmed subscription.
- `GET, POST /subscriptions/`: Subscription management.
- `POST /subscriptions/{id}/activate/`: Activates subscription and sets next billing date.
- `POST /subscriptions/{id}/pause/`: Suspends active subscription if permitted by plan.
- `POST /subscriptions/{id}/resume/`: Resumes paused subscription.
- `POST /subscriptions/{id}/close/`: Terminates subscription.
- `POST /subscriptions/{id}/renew/`: Renews expired or completed contract.

## Invoicing & Payments
- `GET, POST /invoices/`: View and generate invoices.
- `POST /invoices/{id}/confirm/`: Transitions draft invoice to confirmed.
- `POST /invoices/{id}/send_invoice/`: Marks invoice as sent to customer.
- `POST /invoices/{id}/cancel/`: Cancels unpaid invoice.
- `POST /invoices/generate-invoices/`: Runs automated batch billing for all due subscriptions.
- `GET, POST /payments/`: Record and inspect transaction entries.
- `GET, POST /discounts/`: Admin discount rules.
- `GET, POST /tax-rules/`: Tax percentage rules.
- `GET /dashboard/stats/`: Key metrics and monthly revenue chart data.

