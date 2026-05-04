// ============== Preview ==============
const PreviewView = {
  current: null,

  render(id) {
    const inv = Store.getInvoice(id);
    if (!inv) { UI.toast("Invoice not found", "error"); location.hash = "#/invoices"; return; }
    PreviewView.current = inv;
    const status = Utils.computeStatus(inv);

    UI.setTitle(`Preview · ${inv.invNumber}`, "Workspace › Invoices");
    UI.setTopActions([
      UI.btn("← Back", () => location.hash = "#/invoices", "btn btn-ghost"),
      UI.btn("Edit", () => location.hash = `#/invoices/${inv.id}`, "btn btn-soft"),
      UI.btn("Print", () => window.print(), "btn btn-soft"),
      UI.btn("Email", () => PreviewView.email(), "btn btn-soft"),
      UI.btn("Download PDF", () => PreviewView.downloadPDF(), "btn btn-primary"),
    ]);

    PreviewView.draw(status);
    if (window.lucide) lucide.createIcons();
  },

  draw(status) {
    const inv = PreviewView.current;
    const s = Store.settings();
    const c = Store.getClient(inv.clientId) || {};
    const t = Utils.computeTotals(inv);

    const view = $("view");
    view.innerHTML = `
      <div class="p-6 max-w-5xl mx-auto">
        <div style="text-align:center;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:10px;">
          ${Utils.statusPill(status)}
          <span style="font-family:var(--font-accent);font-size:10px;letter-spacing:0.1em;color:var(--color-cappuccino);text-transform:uppercase;">${Utils.escapeHtml(inv.invNumber)}</span>
        </div>
        <div id="preview" class="relative">

          ${status === "Paid" ? '<div class="stamp" style="top:130px;right:80px;">Paid</div>' : ""}
          ${status === "Overdue" ? '<div class="stamp overdue" style="top:130px;right:80px;">Overdue</div>' : ""}

          <!-- Header -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px;">
            <div>
              ${s.logo
                ? `<img src="${s.logo}" style="max-height:72px;max-width:220px;">`
                : `<div style="font-family:var(--font-serif);font-size:26px;font-weight:400;color:var(--color-espresso);">${Utils.escapeHtml(s.companyName || "Mallo")}</div>`
              }
              <div style="font-family:var(--font-accent);font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--color-cappuccino);margin-top:6px;">Trattoria Italiana</div>
            </div>
            <div style="text-align:right;">
              <h1 class="invoice-title">Invoice</h1>
              <table class="meta-table" style="margin-left:auto;margin-top:12px;">
                <tr><td class="label">Invoice No.</td><td style="color:var(--color-espresso);font-weight:500;">${Utils.escapeHtml(inv.invNumber)}</td></tr>
                ${inv.invRef ? `<tr><td class="label">Reference</td><td>${Utils.escapeHtml(inv.invRef)}</td></tr>` : ""}
                <tr><td class="label">Date</td><td>${Utils.fmtDate(inv.invDate)}</td></tr>
                <tr><td class="label">Due Date</td><td>${Utils.fmtDate(inv.invDue)}</td></tr>
                ${inv.invSales ? `<tr><td class="label">Salesperson</td><td>${Utils.escapeHtml(inv.invSales)}</td></tr>` : ""}
              </table>
            </div>
          </div>

          <hr class="preview-divider">

          <!-- From / Bill To -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-top:4px;">
            <div>
              <div class="section-head">From</div>
              <div style="font-family:var(--font-serif);font-size:15px;color:var(--color-espresso);margin-bottom:4px;">${Utils.escapeHtml(s.companyName || "")}</div>
              <div style="color:var(--color-ristretto);white-space:pre-line;font-size:12px;">${Utils.escapeHtml(s.companyAddress || "")}</div>
              ${s.companyPhone ? `<div style="color:var(--color-cappuccino);font-size:12px;margin-top:4px;">${Utils.escapeHtml(s.companyPhone)}</div>` : ""}
              ${s.companyEmail ? `<div style="color:var(--color-cappuccino);font-size:12px;">${Utils.escapeHtml(s.companyEmail)}</div>` : ""}
              ${s.companyTaxId ? `<div style="color:var(--color-cappuccino);font-size:12px;">Tax: ${Utils.escapeHtml(s.companyTaxId)}</div>` : ""}
            </div>
            <div>
              <div class="section-head">Bill To</div>
              <div style="font-family:var(--font-serif);font-size:15px;color:var(--color-espresso);margin-bottom:4px;">${Utils.escapeHtml(c.name || "")}</div>
              <div style="color:var(--color-ristretto);white-space:pre-line;font-size:12px;">${Utils.escapeHtml(c.address || "")}</div>
              ${c.phone ? `<div style="color:var(--color-cappuccino);font-size:12px;margin-top:4px;">${Utils.escapeHtml(c.phone)}</div>` : ""}
              ${c.email ? `<div style="color:var(--color-cappuccino);font-size:12px;">${Utils.escapeHtml(c.email)}</div>` : ""}
              ${c.taxId ? `<div style="color:var(--color-cappuccino);font-size:12px;">Tax ID: ${Utils.escapeHtml(c.taxId)}</div>` : ""}
            </div>
          </div>

          <!-- Line Items -->
          <table class="items">
            <thead>
              <tr>
                <th style="width:20%">Product</th>
                <th>Description</th>
                <th class="num-right" style="width:8%">Qty</th>
                <th class="num-right" style="width:14%">Price</th>
                <th class="num-right" style="width:8%">Disc</th>
                <th class="num-right" style="width:8%">Tax</th>
                <th class="num-right" style="width:14%">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${(inv.items || []).filter(it => it.name || +it.qty || +it.price).map(it => {
                const qty = +it.qty || 0, price = +it.price || 0, disc = +it.disc || 0, tax = +it.tax || 0;
                const gross = qty * price; const dAmt = gross * disc / 100; const net = gross - dAmt;
                const tAmt = net * tax / 100; const amount = net + tAmt;
                return `<tr>
                  <td style="font-family:var(--font-serif);font-style:italic;">${Utils.escapeHtml(it.name)}</td>
                  <td style="color:var(--color-ristretto);">${Utils.escapeHtml(it.desc || "")}</td>
                  <td class="num-right">${Utils.fmtNum(qty, 0)}</td>
                  <td class="num-right">${Utils.fmtNum(price, 2)}</td>
                  <td class="num-right" style="color:var(--color-cappuccino);">${disc ? disc + "%" : "—"}</td>
                  <td class="num-right" style="color:var(--color-cappuccino);">${tax ? tax + "%" : "—"}</td>
                  <td class="num-right" style="font-weight:500;">${Utils.fmtNum(amount, 2)}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>

          <!-- Totals -->
          <table class="totals-table" style="margin-top:24px;">
            <tr><td class="label">Subtotal</td><td class="num-right">${Utils.fmt(t.subtotal)}</td></tr>
            ${t.totalDiscount ? `<tr><td class="label">Discount</td><td class="num-right">− ${Utils.fmt(t.totalDiscount)}</td></tr>` : ""}
            ${t.delivery ? `<tr><td class="label">Delivery</td><td class="num-right">${Utils.fmt(t.delivery)}</td></tr>` : ""}
            ${t.tax ? `<tr><td class="label">Tax</td><td class="num-right">${Utils.fmt(t.tax)}</td></tr>` : ""}
            <tr class="grand"><td class="label">Total</td><td class="num-right">${Utils.fmt(t.total)}</td></tr>
            ${t.paid ? `<tr><td class="label">Paid</td><td class="num-right">− ${Utils.fmt(t.paid)}</td></tr>` : ""}
            <tr class="grand"><td class="label">Balance Due</td><td class="num-right">${Utils.fmt(t.balance)}</td></tr>
          </table>

          <!-- Payment History -->
          ${(inv.payments && inv.payments.length) ? `
            <div style="margin-top:36px;">
              <div class="section-head">Payment History</div>
              <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <thead>
                  <tr style="background:var(--color-crema);">
                    <th style="text-align:left;padding:7px 12px;font-family:var(--font-accent);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-cappuccino);font-weight:400;">Date</th>
                    <th style="text-align:left;padding:7px 12px;font-family:var(--font-accent);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-cappuccino);font-weight:400;">Method</th>
                    <th style="text-align:left;padding:7px 12px;font-family:var(--font-accent);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-cappuccino);font-weight:400;">Reference</th>
                    <th style="text-align:right;padding:7px 12px;font-family:var(--font-accent);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-cappuccino);font-weight:400;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${inv.payments.map(p => `<tr style="border-bottom:1px solid var(--color-border-light);">
                    <td style="padding:7px 12px;color:var(--color-ristretto);">${Utils.fmtDate(p.date)}</td>
                    <td style="padding:7px 12px;color:var(--color-ristretto);">${Utils.escapeHtml(p.method || "")}</td>
                    <td style="padding:7px 12px;color:var(--color-cappuccino);">${Utils.escapeHtml(p.note || "")}</td>
                    <td style="padding:7px 12px;text-align:right;color:var(--color-espresso);font-family:var(--font-serif);font-size:13px;">${Utils.fmt(p.amount)}</td>
                  </tr>`).join("")}
                </tbody>
              </table>
            </div>` : ""}

          <!-- Notes / Terms -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-top:36px;">
            <div>
              <div class="section-head">Notes</div>
              <div style="color:var(--color-ristretto);white-space:pre-line;font-size:12px;line-height:1.6;">${Utils.escapeHtml(inv.notes || "")}</div>
            </div>
            <div>
              <div class="section-head">Terms &amp; Conditions</div>
              <div style="color:var(--color-ristretto);white-space:pre-line;font-size:12px;line-height:1.6;">${Utils.escapeHtml(inv.terms || "")}</div>
            </div>
          </div>

          <!-- Signature -->
          ${s.signature ? `
            <div style="margin-top:48px;text-align:right;">
              <div style="font-family:var(--font-accent);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--color-cappuccino);margin-bottom:8px;">Authorized Signature</div>
              <img src="${s.signature}" style="max-height:80px;margin-left:auto;display:block;">
              <div style="font-family:var(--font-serif);font-size:14px;color:var(--color-espresso);margin-top:8px;">${Utils.escapeHtml(s.companyName || "")}</div>
            </div>` : ""}

          <!-- Footer -->
          <div style="margin-top:48px;padding-top:20px;border-top:1px solid var(--color-border-light);text-align:center;">
            <span style="font-family:var(--font-accent);font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--color-cappuccino);">Generated with Mallo Invoicing</span>
          </div>

        </div>
      </div>
    `;
  },

  async downloadPDF() {
    UI.toast("Generating PDF…");
    const el = $("preview");
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const ratio = Math.min((pageW - 40) / canvas.width, (pageH - 40) / canvas.height);
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;
    if (h <= pageH - 40) {
      pdf.addImage(imgData, "PNG", (pageW - w) / 2, 20, w, h);
    } else {
      const fullRatio = (pageW - 40) / canvas.width;
      const fullW = canvas.width * fullRatio;
      const fullH = canvas.height * fullRatio;
      const sliceH = pageH - 40;
      let y = 0;
      while (y < fullH) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 20, 20 - y, fullW, fullH);
        y += sliceH;
      }
    }
    const num = (PreviewView.current.invNumber || "invoice").replace(/[^\w\-]/g, "_");
    pdf.save(`${num}.pdf`);
    UI.toast("PDF downloaded", "success");
  },

  email() {
    const inv = PreviewView.current;
    const c = Store.getClient(inv.clientId) || {};
    const t = Utils.computeTotals(inv);
    const s = Store.settings();
    if (!c.email) { UI.toast("Client has no email address", "error"); return; }
    const subj = encodeURIComponent(`Invoice ${inv.invNumber} from ${s.companyName}`);
    const body = encodeURIComponent(
`Dear ${c.name},

Please find attached invoice ${inv.invNumber} dated ${Utils.fmtDate(inv.invDate)}.

Total amount due: ${Utils.fmt(t.balance)}
Due date: ${Utils.fmtDate(inv.invDue)}

${inv.terms ? "Payment instructions:\n" + inv.terms + "\n\n" : ""}Thank you for your business.

Best regards,
${s.companyName}`);
    window.location.href = `mailto:${c.email}?subject=${subj}&body=${body}`;
  }
};
