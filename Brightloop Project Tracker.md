---
title: Brightloop Subscription Management — Project Tracker
aliases:
  - Brightloop Tracker
  - Subscription Management Tracker
project: Brightloop Subscription Management
client: Brightloop Software Inc.
status: active
version: 1.0.0
phase: v1.0 released — planning next iteration
created: 2026-10-31
updated: 2026-10-31
repo: local (branch: master)
stack:
  - Django 4.2 + DRF
  - React 18 + Vite 6
  - Tailwind CSS v4
  - SQLite
tags:
  - project/brightloop
  - type/tracker
  - stack/django
  - stack/react
---

# 🚀 Brightloop Subscription Management

> [!info] Project at a glance
> Full-stack subscription lifecycle platform for **Brightloop Software Inc.** — products & variants, plans, quotations, subscriptions, recurring invoices, taxes, discounts, payments, and executive reporting.
> **Current state:** v1.0 feature-complete. Working tree has uncommitted modifications relative to commit `cb24e2e`.

**Docs:** [[README]] · [[PROJECT_GUIDE]] · [[CHANGELOG]]

---

## 📌 Status Board

| Area | Status | Notes |
| :--- | :--- | :--- |
| Backend API | ✅ Done | 7 Django apps under `/api/v1/` |
| Frontend UI | ✅ Done | 18 pages, admin/staff + customer portal |
| Auth & RBAC | ✅ Done | JWT, Admin / Staff / Customer roles |
| Billing engine | ✅ Done | Batch + CLI invoice generation, duplicate protection |
| Reporting | ✅ Done | Dashboard KPIs + revenue chart |
| Test suite | ⬜ Not started | No automated tests yet |
| Deployment | ⬜ Not started | Local dev only |
| PostgreSQL migration | ⬜ Not started | SQLite currently |

**Overall progress:** `██████████░░░░` ~70% to production-ready
**v1.0 scope:** 100% · **Production readiness:** ~40%

---

## 🗺 Milestones

### v1.0 — Initial Release ✅
- [x] Customer registration, login, and role-based access
- [x] Products, variants, and subscription plans
- [x] Quotations → confirmed subscription conversion
- [x] Subscription lifecycle (activate / pause / resume / close / renew)
- [x] Recurring invoice generation with duplicate-billing protection
- [x] Tax rules and discount rules
- [x] Payments with automatic reconciliation
- [x] Executive dashboard and customer portal
- [x] Seed data + invoice generation management commands
- [x] Frontend production build verified

### v1.1 — Hardening (proposed)
- [ ] Add backend automated tests (models, permissions, billing logic)
- [ ] Add frontend smoke tests
- [ ] Fix / review uncommitted working-tree changes and commit
- [ ] Environment-based settings (`SECRET_KEY`, `DEBUG`, CORS, DB)
- [ ] PostgreSQL migration path
- [ ] API documentation (OpenAPI / Swagger)

### v1.2 — Operations (proposed)
- [ ] Docker Compose for backend + frontend
- [ ] CI pipeline (lint, test, build)
- [ ] Email delivery for invoices and quotations
- [ ] Password reset flow
- [ ] Audit log for admin actions
- [ ] CSV / PDF export for reports

> [!note] Scope discipline
> v1.1 and v1.2 items are **proposals**, not committed scope. Confirm priorities before starting.

---

## 🧩 Module Tracker

### Backend — `backend/`

| App              | Responsibility                                                  | Status |
| :--------------- | :-------------------------------------------------------------- | :----- |
| `accounts/`      | Custom user model, roles, registration, staff provisioning, JWT | ✅      |
| `products/`      | `Product`, `ProductVariant`, `SubscriptionPlan`                 | ✅      |
| `subscriptions/` | Quotations, templates, lines, subscriptions + lifecycle actions | ✅      |
| `invoices/`      | Invoices, lines, `TaxRule`, batch generation, duplicate guard   | ✅      |
| `payments/`      | Payment recording + auto reconciliation                         | ✅      |
| `discounts/`     | Fixed/percentage rules, eligibility, usage limits               | ✅      |
| `dashboard/`     | KPI stats, revenue trend, overdue list                          | ✅      |

**Management commands**
- `python manage.py seed_data` — demo accounts, catalog, sample records
- `python manage.py generate_invoices` — CLI billing run

### Frontend — `frontend/src/`

| Group | Pages | Status |
| :--- | :--- | :--- |
| Auth | `Login`, `Register`, `AuthContext`, route guards | ✅ |
| Admin/Staff | `Dashboard`, `Customers`, `Products`, `Plans`, `Quotations`, `Subscriptions`, `Invoices`, `Payments`, `Discounts`, `TaxRules`, `Staff`, `Settings` | ✅ |
| Customer portal | `MySubscriptions`, `MyInvoices`, `MyPayments` | ✅ |
| Shared UI | `Layout`, `Sidebar`, `TopBar`, `DataTable`, `StatCard`, `StatusBadge`, `Modal`, `FormField`, `PageHeader` | ✅ |

---

## 🔑 Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| Administrator | `admin@brightloop.com` | `Admin@123` |
| Staff | `sarah.staff@brightloop.com` | `Staff@123` |
| Customer (Acme) | `acme.corp@example.com` | `Customer@123` |
| Customer (TechFlow) | `techflow.io@example.com` | `Customer@123` |
| Customer (Starlight) | `starlight.retail@example.com` | `Customer@123` |

> [!warning] Demo credentials only
> Seeded passwords must never be used in a deployed environment.

---

## 🛠 Runbook

### Backend — `http://localhost:8000`
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py migrate          # first run
python manage.py seed_data        # first run
python manage.py runserver 8000
```

### Frontend — `http://localhost:5173`
```powershell
cd frontend
npm run dev
```

### Production build check
```powershell
cd frontend
npm run build
```

### One-shot launcher
```powershell
.\run_servers.bat
```

---

## ⚠️ Risks & Known Issues

| # | Item | Impact | Status |
| :--- | :--- | :--- | :--- |
| 1 | 57 files modified but uncommitted since `cb24e2e` | Work could be lost / unclear history | 🔴 Open |
| 2 | No automated tests | Regressions likely as system grows | 🔴 Open |
| 3 | SQLite in use | Concurrency limits, not production-grade | 🟡 Accepted for now |
| 4 | No deployment / hosting setup | System is local-only | 🟡 Open |
| 5 | Secrets and settings likely hardcoded | Security risk before deploy | 🟡 Review |
| 6 | No email delivery for invoices | Manual sending required | 🟡 Backlog |

---

## 📝 Task Backlog

### 🔥 Now
- [ ] Review the uncommitted diff and split into logical commits
- [ ] Write model + permission tests for `accounts` and `subscriptions`
- [ ] Write billing tests: duplicate-period protection, reconciliation

### ⏭ Next
- [ ] Externalize settings via `.env`
- [ ] Add API schema docs
- [ ] Add PostgreSQL configuration and migration guide

### 💡 Later
- [ ] Dockerize backend and frontend
- [ ] CI workflow (lint → test → build)
- [ ] Email templates for invoices / quotations
- [ ] Password reset
- [ ] Audit trail
- [ ] Report exports

---

## 🧠 Decisions Log

| Date | Decision | Rationale |
| :--- | :--- | :--- |
| 2026-10-31 | SQLite for v1.0 | Fast local bring-up; schema kept PostgreSQL-compatible |
| 2026-10-31 | JWT (SimpleJWT) auth | Stateless API suited to SPA frontend |
| 2026-10-31 | Role field on custom user | Simple, explicit RBAC without extra dependency |
| 2026-10-31 | One-click quotation acceptance | Removes manual re-entry between sales and billing |

---

## 📓 Session Log

### 2026-10-31 — Tracker created
- Reviewed [[README]], [[PROJECT_GUIDE]], [[CHANGELOG]] and repo state.
- Confirmed v1.0 feature scope complete; noted uncommitted working-tree changes.
- Created this tracker as the Obsidian entry point for the project.

<!--
Template for new entries:

### YYYY-MM-DD — <focus>
- What changed:
- Why:
- Blockers:
- Next:
-->

---

## 🔗 Quick Links

- [[README]] — setup, modules, demo accounts
- [[PROJECT_GUIDE]] — requirements checklist and architecture
- [[CHANGELOG]] — release notes
- `backend/brightloop/settings.py` — project settings
- `backend/brightloop/urls.py` — API routing
- `frontend/src/App.jsx` — routes and guards
