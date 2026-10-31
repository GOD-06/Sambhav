# Recurring Billing Engine & Protection

## Billing Schedule Logic
When an invoice is generated for a subscription:
1. `next_billing_date` determines the start of the billing interval.
2. The plan frequency (daily, weekly, monthly, yearly) determines the end date of the period.
3. The invoice is generated with:
   - Line items cloned from subscription lines
   - Applicable tax percentage calculated per line
   - Eligible discount deduction applied
   - `billing_period_start` and `billing_period_end` stored on the invoice record
4. `next_billing_date` on the subscription is advanced to the next scheduled interval.

## Duplicate Billing Protection
To safeguard against accidental re-billing:
- Before an invoice is created, the system checks whether an active invoice exists for the same subscription matching `billing_period_start`.
- If an invoice has already been generated for that exact window, the subscription is skipped and logged.

## Automated Invoicing Execution
Billing can be executed through:
1. Web UI: "Run Billing Batch" button on Invoices or Dashboard page.
2. CLI Command:
   ```bash
   python backend/manage.py generate_invoices
   ```
3. Scheduled Cron / Background Worker: Configured to invoke the endpoint or CLI command daily at 00:00 UTC.

