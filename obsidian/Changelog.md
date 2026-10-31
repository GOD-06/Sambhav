# Obsidian Project Change Log

## [1.3.4] - 10 Dedicated Customer Dummy Subscriptions & Admin-Staff Live Visibility

### Changes Implemented
- **10 Dedicated Dummy Subscription Packages**:
  - Seeded 10 distinct software products and active subscription plans:
    1. Starter Cloud Essentials ($19.00 / month)
    2. Developer Pro Sandbox ($29.00 / month)
    3. Team Collaboration Plus ($39.00 / month)
    4. Professional Suite ($49.00 / month)
    5. AI Analytics Intelligence ($79.00 / month)
    6. Enterprise Growth Tier ($99.00 / month)
    7. CyberShield Sentinel ($119.00 / month)
    8. High-Frequency API Gateway ($149.00 / month)
    9. Annual Founder Executive ($490.00 / year)
    10. Global Scale Enterprise Max ($990.00 / year)
  - Configured tailored feature sets and SLAs for each of the 10 packages in `Packages.jsx` and `MySubscriptions.jsx`.
- **Pure Role-Segregated Views**:
  - Removed subscription purchase buttons and buying callouts from admin management tables (`Products.jsx`, `Plans.jsx`, and `Customers.jsx`).
  - Purchasing experience is isolated exclusively to Customer Portal views (`/my-subscriptions` and `/packages`).
- **Real-Time Staff and Admin Visibility**:
  - Verified and confirmed that whenever a customer buys any of the 10 subscriptions:
    - Appears immediately in Staff and Admin `/subscriptions` list with customer details, plan name, status, and renewal dates.
    - Appears immediately in Staff and Admin `/invoices` with full line breakdown and paid status.
    - Appears immediately in Staff and Admin `/payments` with payment method and amount.
    - Updates active subscription counts, revenue totals, and charts in real-time on `/dashboard`.

- **Backend Routing & Alias Fix**:
  - Registered `/api/v1/plans/` route alias alongside `/api/v1/subscription-plans/` in `products/urls.py`, resolving 404 errors for frontend package queries.
  - Verified 10 active subscription plans returned with status 200.

---

## [1.3.3] - Full Problem Statement Alignment & Multi-Interface Hosting

### Changes Implemented
- **Password Reset Flow**:
  - Implemented "Forgot password?" modal on `Login.jsx` connected to `/api/v1/auth/password-reset/`.
  - Created `ResetPassword.jsx` page at `/reset-password/:uid/:token` for completing token-verified password updates.
- **Product Variants**:
  - Seeded "Odoo Brand" variant (with +$560.00 price adjustment) on Professional Suite matching problem statement.
  - Seeded standard license variants across Starter and Enterprise products.
- **Quotation Templates**:
  - Seeded reusable quotation templates with custom validity windows (Enterprise 30 days, Professional 15 days, Growth Pack 45 days).
- **Automated Tax Rules & Discounts**:
  - Seeded tax rules: Standard VAT (10.00%), Software Sales Tax (8.25%), Zero Rate Export (0.00%).
  - Seeded discount rules: Volume Seat Discount (15% off for min quantity >= 5), Growth Promo Fixed ($50 off for > $200), New Customer Welcome (10% off).
- **Multi-Interface Hosting**:
  - Configured Django backend to run on `0.0.0.0:8000` accessible locally and across local area networks.
  - Configured Vite frontend with `--host` binding to `0.0.0.0:5173` accessible at `http://localhost:5173/` and `http://192.168.1.3:5173/`.
  - Built fresh production assets (`frontend/dist/`).

---

## [1.3.2] - Direct In-Page Dummy Products on Customer Portal and Customers Admin

### Changes Implemented
- **Customer Portal Page (`MySubscriptions.jsx`)**:
  - Embedded the full interactive grid of dummy software packages (Starter, Professional, Enterprise, Annual Growth) directly on the customer's page.
  - Customers can now view all dummy products, features, pricing, and billing frequencies without leaving their main subscriptions page.
  - Added self-checkout modal with payment method selection (Card, Bank Transfer, NetBanking), automated instant activation, and one-click receipt download.
  - Supports dynamic view: displays active subscriptions at the top followed by available dummy packages to subscribe.
- **Admin Customers Page (`Customers.jsx`)**:
  - Added discovery banner highlighting available dummy software packages.
  - Added dedicated "Subscribe" action button to each customer row in the table.
  - Created "Subscribe Customer" modal allowing administrators to assign and activate any dummy package for any customer directly from the table.
- **Backend Subscription Assignment**:
  - Extended `/api/v1/subscriptions/subscribe/` endpoint to accept optional `customer_id` parameter when executed by admin or staff accounts.

---

## [1.3.1] - Global Discovery & Subscription Links for Dummy Products

### Changes Implemented
- **Universal Package Discovery**:
  - Added "Subscribe Packages" link in `Sidebar.jsx` across all roles (Admin, Staff, Customer).
  - Added "Subscribe Packages" header shortcut in `Dashboard.jsx`.
- **Products Catalog Integration**:
  - Added top discovery banner in `Products.jsx` linking directly to available software packages.
  - Added dedicated "Subscribe" action button to each product row in the inventory table.
- **Plans Configuration Integration**:
  - Added top banner in `Plans.jsx` highlighting client self-checkout.
  - Added dedicated "Subscribe" action button to each plan row in the table.
- **Customer Portal Activation**:
  - Added "Browse & Subscribe Packages" call to action in `MySubscriptions.jsx` when no subscriptions are active.
  - Added "Subscribe Packages" header button for quick access to more tiers.
- **Product Clarity in Packages View**:
  - Displayed associated product title directly above each package card in `Packages.jsx`.

---

## [1.3.0] - Branding Rename, Google Authentication, Dummy Packages & Receipt Downloads

### Changes Implemented
- **System Rebranding**:
  - Renamed platform from Brightloop to **Subscription Management System**.
  - Updated application title in `index.html`, top navigation bar, sidebar logo (`SM`), and authentication screens.
  - Updated invoice company entities to `Subscription Management System Inc.`.
- **Google Sign-Up and Sign-In**:
  - Implemented `/api/v1/auth/google/` and `/api/v1/accounts/google/` endpoints on Django backend.
  - Added branded Google OAuth authentication buttons on Login and Register views.
  - Provides instant one-click Google authentication with automated customer role provisioning.
- **Dummy Subscription Packages**:
  - Seeded 4 subscription packages via `seed_packages` management command:
    - Starter Plan ($29.00 / month)
    - Professional Plan ($79.00 / month - Most Popular)
    - Enterprise Plan ($199.00 / month)
    - Annual Growth Pack ($790.00 / year - 2 Months Free)
  - Created client-facing catalog view at `/packages` with feature lists and direct subscription capability.
- **Customer Checkout and Payment Engine**:
  - Implemented `/api/v1/subscriptions/subscribe/` endpoint for automated subscription creation, initial invoice generation, and immediate settlement.
  - Added interactive checkout modal with Credit Card, Bank Transfer, and Net Banking options.
  - Enabled "Pay Now" capability on unpaid invoices directly within the Customer Portal (`MyInvoices`).
- **Official Receipt Downloads**:
  - Created `receiptGenerator.js` utility formatting official printable transaction receipts.
  - Added one-click "Download Receipt" actions to `MyPayments`, `MyInvoices` (for paid records), and the post-checkout confirmation screen.
  - Receipts include official reference numbers, customer details, itemized breakdown, and verified paid stamps ready for PDF export or printing.

---

## [1.2.0] - Finance Bento Component Integration & Pro Dark Theme

### Changes Implemented
- **Component Integration**:
  - Integrated `FinanceBento` component (`finance-bento.tsx`) and `FinanceBentoDemo` (`demo.tsx`) into `src/components/ui/`.
  - Added dedicated route `/finance-bento` for full component preview with live charts.
  - Configured `@/components/ui/` as default shadcn component path.
- **Unified Pro Dark Design System**:
  - Switched global theme to pro dark bento aesthetic across the entire application (`bg-black`, `#050507`, `#0E0E10`).
  - Implemented glass cards with subtle borders (`border-white/[0.08]`), backdrop blur, and micro-interactions.
  - Configured Geist and Geist Mono typography with tabular figures for currency and dates.
  - Standardized accent color `#E8FF1F` for primary actions and active navigation states.
- **Backend Data Synchronization**:
  - Integrated live statistics from `/api/v1/dashboard/stats/` directly into dashboard bento tiles.
  - Real revenue chart powered by live transaction payments.

---

## [1.1.0] - Clean Baseline & Styling Overhaul

### Changes Implemented
- **Data Cleanup**: Purged fabricated demo data. Preserved clean administrator account (`admin@brightloop.com`).
- **Text & Tone Refinement**: Removed unnecessary text, marketing filler, demo hints, and redundant descriptions.
- **Typography & Formatting**: Removed all em dashes and en dashes across views, replacing with standard hyphens or clean separators. Removed all emojis.
- **Design System Overhaul**: Removed all AI gradients, background gradients, and aggressive drop-shadows.
- **Obsidian Vault Setup**: Added dedicated `obsidian/` folder containing complete architectural documentation, data models, API reference, access control matrices, and changelog.

---

## [1.0.0] - Initial System Build
- Django 4.2 REST Framework backend with JWT authentication.
- Full React 18 frontend with Vite and Tailwind CSS.
- Role-based routing (Admin, Staff, Customer Portal).
- Products, variants, subscription plans, quotations, subscriptions, batch billing, tax rules, discount rules, payments, and dashboard analytics.
