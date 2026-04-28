# Contributing to Invoicing

Thanks for taking the time to contribute! This document outlines the process for reporting bugs, proposing features, and submitting code.

By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Ways to contribute

- **Report a bug** — open a [bug report](.github/ISSUE_TEMPLATE/bug_report.md).
- **Request a feature** — open a [feature request](.github/ISSUE_TEMPLATE/feature_request.md).
- **Improve documentation** — typos, clearer explanations, more examples — all welcome.
- **Submit code** — fix a bug or add a feature via Pull Request (see below).
- **Triage issues** — help reproduce reports, ask clarifying questions, label issues.

---

## Development setup

The project is **build-free**. There's nothing to install.

```bash
git clone https://github.com/<your-username>/invoicing.git
cd invoicing
# Serve locally (any static server works)
python3 -m http.server 8000
# Open http://localhost:8000
```

Edit any file and refresh the browser to see changes.

### Browser targets

The app targets evergreen browsers — the latest two versions of Chrome, Edge, Firefox, and Safari. ES2017+ syntax is fine. No transpilation is performed.

---

## Coding conventions

- **Vanilla JS only.** Do not introduce frameworks (React, Vue, etc.) or a build step. The whole point is zero-config.
- **CDN for third-party libs.** If you need an extra library, load it via CDN in `index.html`. Avoid bundling.
- **Two-space indentation, semicolons, double quotes** for strings (single quotes acceptable inside HTML attributes).
- **Module pattern** — each view is exported as a single object (`DashboardView`, `EditorView`, …) attached to the global scope. Keep the surface small.
- **DOM helpers** — use `$(id)` and `$$(sel)` from `utils.js` rather than re-typing `document.getElementById`.
- **Money & dates** — always go through `Utils.fmt()` and `Utils.fmtDate()` so currency and locale stay consistent.
- **Status derivation** — never store derived status; compute it via `Utils.computeStatus(invoice)`.
- **No `console.log`** in committed code — remove debug output before submitting.

### File map (where to put things)

| Concern | File |
|---------|------|
| Storage / schema | `js/store.js` |
| Math, formatting, helpers | `js/utils.js` |
| Toast / modal / confirm | `js/ui.js` |
| Routing | `js/router.js` |
| New page | `js/views/<name>.js` + add `<script>` tag in `index.html` + route in `router.js` |
| Styling | `app.css` (custom utilities) — don't fight Tailwind, complement it |

---

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(editor): add bulk-import line items from CSV
fix(preview): correct totals when discount is 100%
docs(readme): clarify localStorage limits
refactor(store): extract sequence handling
```

Common scopes: `editor`, `preview`, `dashboard`, `clients`, `products`, `settings`, `backup`, `store`, `router`, `ui`, `utils`, `docs`, `ci`.

---

## Pull request process

1. **Fork** the repo and create a branch from `main`:
   ```bash
   git checkout -b feat/recurring-invoices
   ```
2. **Make focused commits.** One concern per PR. Smaller PRs land faster.
3. **Test manually** on at least Chrome and Firefox:
   - Create a new invoice end-to-end (client → items → payment → PDF).
   - Verify backup/restore round-trips your data unchanged.
   - If you touched calculations, verify totals on edge cases (0 qty, 100% discount, mixed tax rates).
4. **Update documentation** if behavior or data shape changes (`README.md`, `CHANGELOG.md`).
5. **Open a PR** against `main` using the [PR template](.github/PULL_REQUEST_TEMPLATE.md). Link the issue it fixes.
6. **Be patient and responsive** during review. Maintainers may request changes.

### PR checklist

- [ ] My changes follow the coding conventions above
- [ ] I tested the affected screens manually in at least one browser
- [ ] I updated `CHANGELOG.md` under "Unreleased"
- [ ] I updated `README.md` if user-facing behavior changed
- [ ] No `console.log`, debugger, or commented-out code
- [ ] No new dependencies added to the source tree (CDN-only is fine)

---

## Reporting security vulnerabilities

**Do not open a public issue.** Please follow the process in [SECURITY.md](SECURITY.md).

---

## Licensing

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE) of this project.
