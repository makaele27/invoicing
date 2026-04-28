# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Recurring invoices
- Multi-currency support
- i18n (Bahasa Indonesia / English)

---

## [1.0.0] — 2026-04-28

Initial public release.

### Added
- **Dashboard** with stat cards (Total Revenue, Outstanding, Overdue, This Month) and recent invoices.
- **Invoices list** with search by number/client, status filter, and sort by date or amount.
- **Invoice editor**
  - Auto-incrementing invoice number with configurable prefix and padding.
  - Live calculation of subtotal, line discounts, additional discount (flat or %), delivery fee, tax, total, and balance.
  - Client picker with inline "+ New Client" creation.
  - Product catalog picker.
  - Payment terms (days) field that auto-fills the due date.
  - Multiple tax rates per line.
- **Preview**
  - Print-ready A4 layout with company logo and signature.
  - "PAID" / "OVERDUE" status stamps.
  - Payment history table.
  - One-click PDF export (multi-page aware).
  - "Email Invoice" via `mailto:` with pre-filled subject and body.
- **Payments** — record partial or full payments with method and reference; auto-status update.
- **Clients** — full CRUD, search, per-client invoice count, deletion guard.
- **Products** — full CRUD with SKU, description, default tax rate.
- **Settings** — company info, logo and signature upload, currency symbol, default tax %, default payment days, invoice prefix, default notes and T&Cs.
- **Backup & Restore** — JSON export/import, CSV invoice export, factory reset, sample data seeding.
- **Status derivation** — Draft / Sent / Partial / Paid / Overdue / Cancelled computed from payments and due date.
- **Hash routing** for all views.
- **Modal, toast, and confirm** UI primitives.
- **localStorage persistence** under `mallo_invoicing_v1`.

[Unreleased]: https://github.com/<your-username>/mallo-invoicing/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/<your-username>/mallo-invoicing/releases/tag/v1.0.0
