# Security Policy

## Supported versions

The latest release on `main` receives security updates. Older versions are not maintained.

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a vulnerability

If you believe you've found a security vulnerability in Mallo Invoicing, please report it **privately** so we can fix it before it becomes public.

**Please do not open a public GitHub issue.**

Instead, email the maintainer:

- **Email:** mikawahjudi@gmail.com
- **Subject line:** `[SECURITY] Mallo Invoicing — <short summary>`

Include in your report:

1. A clear description of the vulnerability and the impact (data loss, XSS, leakage, etc.).
2. Steps to reproduce, including browser/OS where it was observed.
3. A proof-of-concept payload or repro file if applicable.
4. Your name/handle for credit (optional).

You should receive an acknowledgement within **5 business days**, and a status update within **14 days**.

## Scope

In scope:
- Cross-site scripting (XSS) via invoice fields, notes, terms, client names, etc.
- Local storage / data integrity issues that could corrupt user data.
- Issues in the bundled HTML/CSS/JS that could be exploited when hosted on a static host.

Out of scope:
- Vulnerabilities in third-party CDN scripts (Tailwind, jsPDF, html2canvas) — please report those upstream.
- Findings that require a compromised local browser or device.
- Lack of features that are not security issues (e.g. "the app doesn't have 2FA").

## Data handling

Mallo Invoicing is **fully client-side**. No data is transmitted to a server. All user data lives in the browser's `localStorage` under the key `mallo_invoicing_v1`. Users are responsible for backing up and protecting their own data.

If you host this app for others (multi-tenant scenario), you are responsible for:
- Serving over HTTPS.
- Ensuring users understand their data lives in their browser, not your server.
- Setting an appropriate Content Security Policy (CSP).

## Disclosure timeline

- Day 0: Report received.
- Day 0–5: Acknowledgement and triage.
- Day 5–30: Investigation, patch development, and release.
- Day 30+: Public disclosure (coordinated with the reporter when possible).

Thank you for helping keep Mallo Invoicing safe.
