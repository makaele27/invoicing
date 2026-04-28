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
      UI.btn("✏️ Edit", () => location.hash = `#/invoices/${inv.id}`, "btn btn-soft"),
      UI.btn("🖨 Print", () => window.print(), "btn btn-soft"),
      UI.btn("✉ Email", () => PreviewView.email(), "btn btn-soft"),
      UI.btn("⬇ PDF", () => PreviewView.downloadPDF(), "btn btn-success"),
    ]);

    PreviewView.draw(status);
  },

  draw(status) {
    const inv = PreviewView.current;
    const s = Store.settings();
    const c = Store.getClient(inv.clientId) || {};
    const t = Utils.computeTotals(inv);

    const view = $("view");
    view.innerHTML = `
      <div class="p-6 max-w-5xl mx-auto">
        <div class="text-center text-sm text-gray-500 mb-3">${Utils.statusPill(status)} · Status of ${Utils.escapeHtml(inv.invNumber)}</div>
        <div id="preview" class="relative">
          ${status === "Paid" ? '<div class="stamp" style="top:120px; right:80px;">PAID</div>' : ""}
          ${status === "Overdue" ? '<div class="stamp overdue" style="top:120px; right:80px;">OVERDUE</div>' : ""}

          <div class="flex justify-between items-start gap-6">
            <div>
              ${s.logo ? `<img src="${s.logo}" style="max-height:80px; max-width:240px">` : `<div class="text-2xl font-bold text-blue-900">${Utils.escapeHtml(s.companyName)}</div>`}
            </div>
            <div class="text-right">
              <h1 class="invoice-title">Invoice</h1>
              <table class="meta-table ml-auto mt-3">
                <tr><td class="label">Invoice No.</td><td>${Utils.escapeHtml(inv.invNumber)}</td></tr>
                ${inv.invRef ? `<tr><td class="label">Reference</td><td>${Utils.escapeHtml(inv.invRef)}</td></tr>` : ""}
                <tr><td class="label">Date</td><td>${Utils.fmtDate(inv.invDate)}</td></tr>
                <tr><td class="label">Due Date</td><td>${Utils.fmtDate(inv.invDue)}</td></tr>
                ${inv.invSales ? `<tr><td class="label">Salesperson</td><td>${Utils.escapeHtml(inv.invSales)}</td></tr>` : ""}
              </table>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-12 mt-12">
            <div>
              <div class="section-head">From</div>
              <div class="font-bold">${Utils.escapeHtml(s.companyName)}</div>
              <div class="text-gray-600 whitespace-pre-line">${Utils.escapeHtml(s.companyAddress || "")}</div>
              ${s.companyPhone ? `<div class="text-gray-600 mt-1">Phone: ${Utils.escapeHtml(s.companyPhone)}</div>` : ""}
              ${s.companyEmail ? `<div class="text-gray-600">Email: ${Utils.escapeHtml(s.companyEmail)}</div>` : ""}
              ${s.companyTaxId ? `<div class="text-gray-600">NPWP: ${Utils.escapeHtml(s.companyTaxId)}</div>` : ""}
            </div>
            <div>
              <div class="section-head">Bill To</div>
              <div class="font-bold">${Utils.escapeHtml(c.name || "")}</div>
              <div class="text-gray-600 whitespace-pre-line">${Utils.escapeHtml(c.address || "")}</div>
              ${c.phone ? `<div class="text-gray-600 mt-1">Phone: ${Utils.escapeHtml(c.phone)}</div>` : ""}
              ${c.email ? `<div class="text-gray-600">Email: ${Utils.escapeHtml(c.email)}</div>` : ""}
              ${c.taxId ? `<div class="text-gray-600">Tax ID: ${Utils.escapeHtml(c.taxId)}</div>` : ""}
            </div>
          </div>

          <table class="items">
            <thead>
              <tr>
                <th style="width:18%">Product</th>
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
                  <td>${Utils.escapeHtml(it.name)}</td>
                  <td>${Utils.escapeHtml(it.desc || "")}</td>
                  <td class="num-right">${Utils.fmtNum(qty, 0)}</td>
                  <td class="num-right">${Utils.fmtNum(price, 2)}</td>
                  <td class="num-right">${disc ? disc + "%" : "—"}</td>
                  <td class="num-right">${tax ? tax + "%" : "—"}</td>
                  <td class="num-right">${Utils.fmtNum(amount, 2)}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>

          <table class="totals-table mt-6">
            <tr><td class="label">Subtotal</td><td class="num-right">${Utils.fmt(t.subtotal)}</td></tr>
            ${t.totalDiscount ? `<tr><td class="label">Discount</td><td class="num-right">− ${Utils.fmt(t.totalDiscount)}</td></tr>` : ""}
            ${t.delivery ? `<tr><td class="label">Delivery</td><td class="num-right">${Utils.fmt(t.delivery)}</td></tr>` : ""}
            ${t.tax ? `<tr><td class="label">Tax</td><td class="num-right">${Utils.fmt(t.tax)}</td></tr>` : ""}
            <tr class="grand"><td class="label">Total</td><td class="num-right">${Utils.fmt(t.total)}</td></tr>
            ${t.paid ? `<tr><td class="label">Paid</td><td class="num-right">− ${Utils.fmt(t.paid)}</td></tr>` : ""}
            <tr class="grand"><td class="label">Balance Due</td><td class="num-right">${Utils.fmt(t.balance)}</td></tr>
          </table>

          ${(inv.payments && inv.payments.length) ? `
            <div class="mt-10">
              <div class="section-head">Payment History</div>
              <table style="width:100%; border-collapse: collapse; font-size: 12px;">
                <thead><tr style="background:#f1f5f9">
                  <th style="text-align:left; padding:6px 10px;">Date</th>
                  <th style="text-align:left; padding:6px 10px;">Method</th>
                  <th style="text-align:left; padding:6px 10px;">Reference</th>
                  <th style="text-align:right; padding:6px 10px;">Amount</th>
                </tr></thead>
                <tbody>
                ${inv.payments.map(p => `<tr style="border-bottom:1px solid #e5e7eb">
                  <td style="padding:6px 10px">${Utils.fmtDate(p.date)}</td>
                  <td style="padding:6px 10px">${Utils.escapeHtml(p.method || "")}</td>
                  <td style="padding:6px 10px">${Utils.escapeHtml(p.note || "")}</td>
                  <td style="padding:6px 10px; text-align:right">${Utils.fmt(p.amount)}</td>
                </tr>`).join("")}
                </tbody>
              </table>
            </div>` : ""}

          <div class="grid grid-cols-2 gap-12 mt-12">
            <div>
              <div class="section-head">Notes</div>
              <div class="text-gray-700 whitespace-pre-line">${Utils.escapeHtml(inv.notes || "")}</div>
            </div>
            <div>
              <div class="section-head">Terms &amp; Conditions</div>
              <div class="text-gray-700 whitespace-pre-line">${Utils.escapeHtml(inv.terms || "")}</div>
            </div>
          </div>

          ${s.signature ? `
            <div class="mt-12 text-right">
              <div class="text-xs text-gray-500 mb-2">Authorized Signature</div>
              <img src="${s.signature}" style="max-height:80px; margin-left:auto;">
              <div class="text-sm font-medium mt-2">${Utils.escapeHtml(s.companyName)}</div>
            </div>` : ""}

          <div class="mt-16 text-center text-xs text-gray-400">Generated with Mallo Invoicing</div>
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
      // Multi-page: split image into A4 slices
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
