# Mallo Invoicing

A lightweight, **fully offline, browser-based invoicing application** for small businesses, freelancers, and side projects. Create, manage, and export professional invoices in seconds — no signup, no servers, no monthly fees.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![No Build Step](https://img.shields.io/badge/build-none-success)](#getting-started)
[![Vanilla JS](https://img.shields.io/badge/stack-vanilla%20JS-yellow)](#tech-stack)
[![Local-First](https://img.shields.io/badge/data-local--first-brightgreen)](#data-storage)

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Data Storage](#data-storage)
- [Usage Guide](#usage-guide)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

**Invoice Management**
- Create, edit, duplicate, and delete invoices
- Auto-incrementing invoice numbers with configurable prefix and zero-padding
- Live total, tax, discount, and balance calculations
- Per-line and additional discounts (flat or percentage)
- Delivery fee and multiple tax rates per line
- Status tracking — derived automatically from payments and due date (Draft / Sent / Partial / Paid / Overdue / Cancelled)
- Status stamps ("PAID" / "OVERDUE") rendered on the invoice preview

**Payments**
- Record partial or full payments with method, date, and reference
- Auto-recalculation of balance and status
- Full payment history shown on the printed/exported invoice

**Clients & Products**
- Full CRUD for both, with search and per-client invoice count
- One-click "Add product from catalog" inside the editor
- One-click "New invoice for this client" from the clients list
- Inline "+ New Client" dialog from the invoice editor

**Export & Sharing**
- One-click PDF download (multi-page aware)
- Print-friendly preview with browser print
- "Email Invoice" via `mailto:` with pre-filled subject and body
- Export all invoices to CSV
- Full JSON backup / restore

**Settings & Branding**
- Company info, logo, and signature upload
- Currency symbol, default tax rate, payment terms, invoice prefix
- Default notes and Terms & Conditions auto-applied to new invoices

**No Backend Required**
- Pure HTML/CSS/JS — runs entirely in the browser
- All data stored in `localStorage` (~5 MB capacity)
- Works offline; deploy as a static site (GitHub Pages, Netlify, Vercel)

---

## Getting Started

### Option 1 — Just open it

The app has no build step. Clone or download the repo, then double-click `index.html`.

```bash
git clone https://github.com/<your-username>/mallo-invoicing.git
cd mallo-invoicing
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

### Option 2 — Serve locally (recommended)

Some browsers restrict `localStorage` on `file://` URLs. Run a tiny static server:

```bash
# Python 3
python3 -m http.server 8000

# Node (npx)
npx serve .

# PHP
php -S localhost:8000
```

Then visit <http://localhost:8000>.

### Option 3 — Deploy as a static site

Drop the contents of this repo into any static host:
- **GitHub Pages** — push to a repo, enable Pages in Settings → Pages, source `main` branch.
- **Netlify / Vercel** — drag the folder into the deploy UI.
- **Cloudflare Pages** — point at the repo, no build command needed.

---

## Project Structure

```
mallo-invoicing/
├── index.html              # App shell (sidebar + topbar + view container)
├── app.css                 # All styles (custom + complements Tailwind CDN)
├── js/
│   ├── app.js              # Boot, sidebar nav, ESC key, badge refresh
│   ├── router.js           # Hash router (#/dashboard, #/invoices/:id, etc.)
│   ├── store.js            # localStorage data layer (clients/products/invoices/settings)
│   ├── utils.js            # Formatting, totals, status derivation, helpers
│   ├── ui.js               # Toast, modal, confirm dialog primitives
│   └── views/
│       ├── dashboard.js    # KPIs + recent invoices
│       ├── invoices.js     # List/search/filter/sort
│       ├── editor.js       # Invoice editor (form + line items + payments)
│       ├── preview.js      # Print-ready preview + PDF export
│       ├── clients.js      # Clients CRUD
│       ├── products.js     # Product catalog CRUD
│       ├── settings.js     # Company info, branding, defaults
│       └── backup.js       # Export/Import/Reset
├── docs/                   # Documentation assets (screenshots, etc.)
├── LICENSE
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── .github/
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md
    │   └── feature_request.md
    └── PULL_REQUEST_TEMPLATE.md
```

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Markup | HTML5 | — |
| Styling | Tailwind CSS (CDN) + custom `app.css` | No build step |
| Scripting | Vanilla JS (ES2017+) | Zero dependencies in the source tree |
| PDF | [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://github.com/niklasvh/html2canvas) | Loaded from CDN |
| Storage | `localStorage` | Local-first, no server |
| Routing | Hash-based | Works on `file://` and any static host |

**No npm, no bundler, no transpiler.** All third-party libraries are loaded from CDN at runtime.

---

## Data Storage

Mallo stores everything under a single `localStorage` key:

```
mallo_invoicing_v1
```

The schema (simplified):

```jsonc
{
  "settings": {
    "companyName": "...",
    "companyAddress": "...",
    "logo": "data:image/png;base64,...",
    "currency": "Rp",
    "invoicePrefix": "INV/2026/",
    "invoiceNextNumber": 1,
    "invoicePadding": 4,
    "defaultTax": 0,
    "defaultPaymentDays": 14,
    "defaultTerms": "...",
    "defaultNotes": "..."
  },
  "clients":  [{ "id": "...", "name": "...", "email": "...", ... }],
  "products": [{ "id": "...", "name": "...", "price": 0, "taxRate": 0, ... }],
  "invoices": [{
    "id": "...", "invNumber": "...", "invDate": "...", "invDue": "...",
    "clientId": "...", "items": [...], "payments": [...], "status": "..."
  }]
}
```

**Always export a backup before clearing browser data.** The `Backup & Restore` view provides one-click JSON export and CSV invoice export.

> **Privacy:** No data ever leaves the user's browser. There is no telemetry, no tracking, no remote API.

---

## Usage Guide

### Quick Start

1. Open the app — you'll land on the **Dashboard**.
2. Click **Settings** in the sidebar and fill in your company info, logo, and currency. (Or click **Backup → Load sample data** to explore with demo content.)
3. Go to **Clients** → **New Client** and add your first client.
4. (Optional) Go to **Products** → **New Product** to build a reusable catalog.
5. Click **+ New Invoice** in the topbar, select a client, add line items, and click **Save**.
6. From the preview, click **⬇ PDF** to download, or **✉ Email** to draft an email to the client.

### Recording a Payment

Open an invoice → scroll to the right column → **+ Record Payment** → enter amount, date, method. The status auto-updates to `Partial` or `Paid`.

### Backup

Open **Backup** → **Download backup (.json)** regularly. To migrate to another browser, open the app on the new device → **Backup** → **Select backup file**.

### Customising the Invoice Number Format

In **Settings**, change:
- `Invoice Number Prefix` (e.g. `INV/2026/`, `MALLO-`, etc.)
- `Next Invoice Number` (manual override)
- `Number Padding` (e.g. 4 → `0001`)

Live preview updates as you type.

---

## Roadmap

- [ ] Multi-currency invoices with conversion
- [ ] Recurring / subscription invoices
- [ ] Invoice templates (multiple layouts)
- [ ] Light/dark theme
- [ ] Export to e-Faktur (Indonesian tax) format
- [ ] Optional cloud sync via user-supplied backend (Supabase / Firebase)
- [ ] Mobile-optimised layout
- [ ] i18n (Bahasa Indonesia / English toggle)

Have an idea? Open a [feature request](.github/ISSUE_TEMPLATE/feature_request.md).

---

## Contributing

Contributions are very welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Security

Found a security issue? Please report it privately — see [SECURITY.md](SECURITY.md). Do **not** open a public issue.

---

## License

[MIT](LICENSE) © Mika Wahjudi
