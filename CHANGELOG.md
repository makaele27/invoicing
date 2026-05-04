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

## [1.1.0] — 2026-05-04

Graphic overhaul — full alignment with the Mallo Trattoria Italiana design system.
All business logic and localStorage data from v1.0 are fully preserved; this release is visual-only.

### Changed

#### Design system — colors
- Replaced all blue/indigo brand tokens (`#2563eb`) with the official Mallo palette
- Sidebar background: `#1e3a8a` gradient → `#3a1c0b` (espresso), flat
- Page background: `#f1f5fb` → `#faf7f2` (latte)
- Card backgrounds: pure white on gray → white on latte, with warm cappuccino borders (`#e8e0d5`)
- Primary accent: blue → teal `#5dabb5` across buttons, focus rings, active nav states, and links
- All neutral tones shifted to warm brown-cream undertones; no cool grays remain

#### Design system — typography
- Body font: Inter / system-ui → **Quicksand Light** (300)
- Display / headings: → **EB Garamond** Regular (400) — page titles, invoice "Invoice" heading, modal titles, section headers
- Labels / badges / eyebrows: → **Parkinsans Light** (300) with wide letter-spacing (0.12–0.2em) and uppercase
- Menu item names in invoice preview now render in EB Garamond italic

#### Sidebar
- Removed blue gradient; sidebar is now solid espresso `#3a1c0b`
- Official Mallo white wordmark logo replaces the `M` avatar + text lockup
- Nav link copy styled in Quicksand Light, cappuccino tone; teal active state with teal-light text
- Group labels use Parkinsans, 0.16em tracking, muted cappuccino
- Footer version label updated to `v1.1 · Local-first`

#### Iconography
- All emoji (📊 📄 👥 📦 ⚙️ 💾 💰 ⏳ ⚠️ 📅) removed from nav and stat cards
- Replaced with [Lucide](https://lucide.dev) line icons at 15px (nav) and 22px (stat cards)
- Icons tinted teal on dark surfaces; espresso-tinted on light surfaces

#### Status pills
- Full palette remap to warm earth tones:
  - Draft: warm stone background, brown text
  - Sent: teal-wash background, teal-dark text
  - Paid: forest-wash background, forest text
  - Overdue: terracotta-wash background, terracotta text
  - Partial: gold-wash background, amber text
  - Cancelled: warm gray background, muted text, strikethrough
- Typography: Parkinsans Medium, 10px, 0.06em tracking, uppercase

#### Invoice preview
- "Invoice" title: bold Inter 38px blue → EB Garamond italic 42px espresso
- Header now shows "Trattoria Italiana" eyebrow beneath the company name/logo
- Line-items table header: blue `#1e3a8a` → espresso `#3a1c0b` with crema text
- Alternating row stripes use latte background
- Product names in line items render in EB Garamond italic
- Totals table grand-total rows use crema background with serif type
- Section heads (From, Bill To, Notes, Terms, Payment History) use Parkinsans uppercase labels
- PAID stamp: solid green → warm forest green; OVERDUE stamp: red → terracotta
- Footer line: "Generated with Mallo Invoicing" in Parkinsans uppercase, cappuccino

#### Buttons
- All button families (primary, soft, ghost, danger, warning, success) remapped to Mallo palette
- Font: Quicksand Medium, 12px, 0.04em tracking
- Border radius: `6px` → `4px` (Mallo `--radius-sm`)

#### Cards & stat cards
- `card-elev`: border-radius `10px` → `8px`; shadow uses espresso-tinted `rgba(58,28,11,…)`
- `stat-card`: added a 3px bottom accent bar in teal (35% opacity)
- Stat values now use EB Garamond 28px; stat labels use Parkinsans uppercase

#### Tables
- Header cells: `background: #f8fafc`, Inter bold → `background: var(--color-crema)`, Parkinsans Medium uppercase
- Row hover: `#f8fafc` → latte `#faf7f2`
- Empty state copy set in EB Garamond italic
- Invoice number links styled in teal (replacing blue)

#### Modal
- Backdrop: slate overlay → espresso-tinted with 2px blur
- Modal title: Inter semibold → EB Garamond Regular 18px
- Footer area: white → crema background

#### Toast
- Background: `#111827` → espresso `#3a1c0b`
- Left accent border: teal (success) / terracotta (error)
- Font: Quicksand → Parkinsans, 12px, 0.06em tracking

#### Forms
- `.label`: Inter 600 → Parkinsans Medium, 10px, 0.12em tracking, ristretto color
- `.field` focus: blue ring → teal ring `rgba(93,171,181,0.15)`
- `.field[readonly]`: gray background → crema background
- `.section-title`: blue bold Inter → EB Garamond Regular 17px ristretto
- Upload box: dashed gray border → dashed cappuccino; hover state teal

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

---

[Unreleased]: https://github.com/makaele27/invoicing/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/makaele27/invoicing/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/makaele27/invoicing/releases/tag/v1.0.0
