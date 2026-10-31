# Obsidian Project Change Log

## [1.1.0] - Clean Baseline & Styling Overhaul

### Changes Implemented
- **Data Cleanup**: Purged all fabricated products, demo subscriptions, fake customer accounts, mock invoices, and sample payments. Preserved clean administrator account (`admin@brightloop.com`).
- **Text & Tone Refinement**: Removed unnecessary text, marketing filler, demo hints, and redundant descriptions across the interface.
- **Typography & Formatting**: Removed all em dashes and en dashes across views, replacing with standard hyphens or N/A indicators. Removed all emojis from the codebase, UI labels, and documentation.
- **Design System Overhaul**: Removed all AI gradients, background gradients, and aggressive drop-shadows. Replaced with flat, high-contrast, clean corporate SaaS design.
- **Dedicated Palette**:
  - Background: Slate 50 (`#f8fafc`)
  - Primary Brand & Buttons: Blue 700 / Blue 800 (`#1d4ed8` / `#1e40af`)
  - Surface: White (`#ffffff`) with Slate 200 border (`#e2e8f0`)
  - Typography: Slate 900 (`#0f172a`), Slate 600 (`#475569`), and Slate 400 (`#94a3b8`)
  - Status Indicators: Emerald (Active/Paid), Amber (Paused/Overdue), Rose (Cancelled/Closed)
- **Obsidian Vault Setup**: Added dedicated `obsidian/` folder containing complete architectural documentation, data models, API reference, access control matrices, and changelog.

---

## [1.0.0] - Initial System Build
- Django 4.2 REST Framework backend with JWT authentication.
- Full React 18 frontend with Vite and Tailwind CSS.
- Role-based routing (Admin, Staff, Customer Portal).
- Products, variants, subscription plans, quotations, subscriptions, batch billing, tax rules, discount rules, payments, and dashboard analytics.
