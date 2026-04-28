// ============== Invoice Editor ==============
const EditorView = {
  current: null, // working copy
  isNew: false,

  render(idOrNew) {
    if (idOrNew === "new") {
      EditorView.isNew = true;
      const s = Store.settings();
      EditorView.current = {
        invNumber: Store.nextInvoiceNumber(),
        invDate: Utils.todayStr(),
        invDue: Utils.addDays(Utils.todayStr(), s.defaultPaymentDays || 14),
        invRef: "", invSales: "",
        status: "Draft",
        clientId: null,
        items: [{ id: Utils.uid(), name: "", desc: "", qty: 1, price: 0, disc: 0, tax: s.defaultTax || 0 }],
        addDisc: 0, addDiscType: "rp", delivery: 0,
        notes: s.defaultNotes || "",
        terms: s.defaultTerms || "",
        payments: []
      };
    } else {
      const inv = Store.getInvoice(idOrNew);
      if (!inv) { UI.toast("Invoice not found", "error"); location.hash = "#/invoices"; return; }
      EditorView.isNew = false;
      EditorView.current = JSON.parse(JSON.stringify(inv));
      EditorView.current.items = (EditorView.current.items || []).map(it => ({ ...it, id: it.id || Utils.uid() }));
      EditorView.current.payments = EditorView.current.payments || [];
    }

    UI.setTitle(EditorView.isNew ? "New Invoice" : `Edit ${EditorView.current.invNumber}`, "Workspace › Invoices");
    UI.setTopActions([
      UI.btn("Cancel", () => location.hash = "#/invoices", "btn btn-ghost"),
      UI.btn("👁 Preview", () => EditorView.preview(), "btn btn-soft"),
      UI.btn("💾 Save", () => EditorView.save(false), "btn btn-primary"),
      UI.btn("Save & New", () => EditorView.save(true), "btn btn-success"),
    ]);

    EditorView.draw();
  },

  draw() {
    const inv = EditorView.current;
    const s = Store.settings();
    const view = $("view");
    view.innerHTML = `
      <div class="p-6 max-w-7xl mx-auto">
        <div class="card card-elev p-8">
          <div class="flex justify-between items-start gap-6 flex-wrap">
            <div>
              <span class="label">Status</span>
              <select id="fStatus" class="field" style="max-width:200px">
                ${["Draft","Sent","Partial","Paid","Overdue","Cancelled"].map(x => `<option ${inv.status === x ? "selected" : ""}>${x}</option>`).join("")}
              </select>
            </div>
            <div class="text-right">
              <div class="text-3xl font-light text-blue-900">INVOICE</div>
              <div class="text-sm text-gray-500 mt-1">Currency: <strong>${Utils.escapeHtml(s.currency)}</strong></div>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <label class="label">Invoice Number *</label>
              <input id="fNumber" class="field flat" value="${Utils.escapeHtml(inv.invNumber)}">
            </div>
            <div>
              <label class="label">Invoice Date *</label>
              <input id="fDate" type="date" class="field flat" value="${inv.invDate || ""}">
            </div>
            <div>
              <label class="label">Reference Number</label>
              <input id="fRef" class="field flat" value="${Utils.escapeHtml(inv.invRef || "")}" placeholder="e.g. PO-12345">
            </div>
            <div>
              <label class="label">Due Date *</label>
              <input id="fDue" type="date" class="field flat" value="${inv.invDue || ""}">
            </div>
            <div>
              <label class="label">Salesperson</label>
              <input id="fSales" class="field flat" value="${Utils.escapeHtml(inv.invSales || "")}" placeholder="e.g. ${Utils.escapeHtml(s.companyName)}">
            </div>
            <div>
              <label class="label">Payment Terms</label>
              <input id="fTermsDays" class="field flat" placeholder="Days" value="${inv.termsDays || s.defaultPaymentDays}">
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-8 mt-10">
            <div>
              <div class="section-title">Our Information</div>
              <div class="text-sm text-gray-700 leading-relaxed">
                <div class="font-semibold">${Utils.escapeHtml(s.companyName)}</div>
                <div class="whitespace-pre-line text-gray-600">${Utils.escapeHtml(s.companyAddress || "")}</div>
                <div class="text-gray-600">${s.companyPhone ? "Phone: " + Utils.escapeHtml(s.companyPhone) : ""}</div>
                <div class="text-gray-600">${s.companyEmail ? "Email: " + Utils.escapeHtml(s.companyEmail) : ""}</div>
                <a href="#/settings" class="text-xs text-blue-600 hover:underline">Edit company info →</a>
              </div>
            </div>
            <div>
              <div class="section-title flex justify-between items-center">
                <span>Bill To (Client)</span>
                <button class="btn btn-soft btn-sm" onclick="EditorView.openClientPicker()">${inv.clientId ? "Change" : "Select"}</button>
              </div>
              <div id="clientBlock"></div>
            </div>
          </div>

          <div class="mt-10">
            <div class="section-title flex justify-between items-center">
              <span>Line Items</span>
              <span class="flex gap-2">
                <button class="btn btn-soft btn-sm" onclick="EditorView.addProductFromCatalog()">＋ From Catalog</button>
                <button class="btn btn-success btn-sm" onclick="EditorView.addLine()">＋ Add Line</button>
              </span>
            </div>
            <div class="scroll-x">
              <table class="w-full text-sm" id="itemsTable">
                <thead>
                  <tr class="bg-slate-100 text-gray-700 text-left text-xs uppercase tracking-wide">
                    <th class="p-2 w-[20%]">Product</th>
                    <th class="p-2 w-[24%]">Description</th>
                    <th class="p-2 w-[8%] num-right">Qty</th>
                    <th class="p-2 w-[14%] num-right">Price</th>
                    <th class="p-2 w-[8%] num-right">Disc %</th>
                    <th class="p-2 w-[8%] num-right">Tax %</th>
                    <th class="p-2 w-[14%] num-right">Amount</th>
                    <th class="p-2 w-12"></th>
                  </tr>
                </thead>
                <tbody id="itemsBody"></tbody>
              </table>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-8 mt-10">
            <div>
              <div class="section-title">Description / Notes</div>
              <textarea id="fNotes" class="field" rows="4" placeholder="Payment instructions, thank-you note, etc.">${Utils.escapeHtml(inv.notes || "")}</textarea>

              <div class="section-title mt-6">Terms &amp; Conditions</div>
              <textarea id="fTerms" class="field" rows="4">${Utils.escapeHtml(inv.terms || "")}</textarea>
            </div>
            <div>
              <div class="section-title">Summary</div>
              <div class="totals-row"><span>Subtotal</span><span id="sumSub">—</span></div>
              <div class="totals-row"><span>Line Discounts</span><span id="sumLineDisc">—</span></div>
              <div class="totals-row items-center">
                <span>Additional Discount</span>
                <span class="flex items-center gap-2">
                  <select id="fAddDiscType" class="field" style="padding:4px 8px;width:64px">
                    <option value="rp" ${inv.addDiscType === "rp" ? "selected" : ""}>${Utils.escapeHtml(s.currency)}</option>
                    <option value="pct" ${inv.addDiscType === "pct" ? "selected" : ""}>%</option>
                  </select>
                  <input id="fAddDisc" type="number" min="0" step="any" value="${inv.addDisc || 0}" class="field text-right" style="width:130px">
                </span>
              </div>
              <div class="totals-row items-center">
                <span>Delivery Fee</span>
                <input id="fDelivery" type="number" min="0" step="any" value="${inv.delivery || 0}" class="field text-right" style="width:130px">
              </div>
              <div class="totals-row"><span>Tax</span><span id="sumTax">—</span></div>
              <div class="totals-row total"><span>Total</span><span id="sumTotal" class="text-blue-700">—</span></div>

              <div class="mt-4 pt-4 border-t border-gray-200">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-semibold">Payments</span>
                  <button class="btn btn-success btn-sm" onclick="EditorView.addPaymentDialog()">＋ Record Payment</button>
                </div>
                <div id="paymentsList" class="text-sm divide-y divide-gray-100"></div>
                <div class="totals-row total"><span>Balance Due</span><span id="sumDue" class="text-red-600">—</span></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    EditorView.bindFields();
    EditorView.renderClient();
    EditorView.renderItems();
    EditorView.renderPayments();
    EditorView.recompute();
  },

  bindFields() {
    const inv = EditorView.current;
    const map = {
      fNumber: "invNumber", fDate: "invDate", fDue: "invDue",
      fRef: "invRef", fSales: "invSales", fStatus: "status",
      fNotes: "notes", fTerms: "terms",
      fAddDisc: "addDisc", fAddDiscType: "addDiscType", fDelivery: "delivery",
    };
    Object.entries(map).forEach(([id, key]) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener("input", () => {
        inv[key] = el.type === "number" ? +el.value : el.value;
        EditorView.recompute();
      });
      el.addEventListener("change", () => {
        inv[key] = el.type === "number" ? +el.value : el.value;
        EditorView.recompute();
      });
    });

    $("fDate").addEventListener("change", () => {
      const days = parseInt($("fTermsDays").value) || Store.settings().defaultPaymentDays;
      $("fDue").value = Utils.addDays($("fDate").value, days);
      inv.invDue = $("fDue").value;
    });

    $("fTermsDays").addEventListener("change", () => {
      const days = parseInt($("fTermsDays").value) || Store.settings().defaultPaymentDays;
      inv.termsDays = days;
      if (inv.invDate) {
        $("fDue").value = Utils.addDays(inv.invDate, days);
        inv.invDue = $("fDue").value;
      }
    });
  },

  renderClient() {
    const inv = EditorView.current;
    const block = $("clientBlock");
    if (!inv.clientId) {
      block.innerHTML = `<div class="text-sm text-gray-500 italic p-4 border border-dashed border-gray-300 rounded-md">No client selected. Click <strong>Select</strong> to choose one or create a new client.</div>`;
      return;
    }
    const c = Store.getClient(inv.clientId);
    if (!c) { inv.clientId = null; EditorView.renderClient(); return; }
    block.innerHTML = `
      <div class="text-sm">
        <div class="font-semibold">${Utils.escapeHtml(c.name)}</div>
        <div class="text-gray-600 whitespace-pre-line">${Utils.escapeHtml(c.address || "")}</div>
        <div class="text-gray-600">${c.phone ? "Phone: " + Utils.escapeHtml(c.phone) : ""}</div>
        <div class="text-gray-600">${c.email ? "Email: " + Utils.escapeHtml(c.email) : ""}</div>
        <div class="text-gray-600">${c.taxId ? "Tax ID: " + Utils.escapeHtml(c.taxId) : ""}</div>
      </div>
    `;
  },

  openClientPicker() {
    const clients = Store.clients();
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <input id="picSearch" placeholder="🔍 Search clients..." class="field mb-3">
      <div id="picList" class="divider-y border border-gray-200 rounded-md max-h-80 overflow-y-auto"></div>
    `;
    const drawList = (q = "") => {
      const list = clients.filter(c => !q || c.name.toLowerCase().includes(q.toLowerCase()) || (c.email || "").toLowerCase().includes(q.toLowerCase()));
      $("picList").innerHTML = list.length === 0
        ? `<div class="p-6 text-center text-sm text-gray-500">No clients found.</div>`
        : list.map(c => `
          <div class="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center" onclick="EditorView.pickClient('${c.id}')">
            <div>
              <div class="font-medium">${Utils.escapeHtml(c.name)}</div>
              <div class="text-xs text-gray-500">${Utils.escapeHtml(c.email || c.phone || c.address || "")}</div>
            </div>
            <span class="text-xs text-blue-600">Select →</span>
          </div>
        `).join("");
    };
    UI.openModal({
      title: "Select Client",
      body: wrap,
      footer: [
        UI.btn("＋ New Client", () => { UI.closeModal(); ClientsView.openForm(null, (id) => { EditorView.pickClient(id); }); }, "btn btn-success"),
        UI.btn("Cancel", UI.closeModal, "btn btn-ghost")
      ]
    });
    setTimeout(() => {
      drawList();
      $("picSearch").addEventListener("input", e => drawList(e.target.value));
      $("picSearch").focus();
    }, 0);
  },

  pickClient(id) {
    EditorView.current.clientId = id;
    UI.closeModal();
    EditorView.renderClient();
  },

  // ===== Items =====
  addLine(data = {}) {
    EditorView.current.items.push({ id: Utils.uid(), name: "", desc: "", qty: 1, price: 0, disc: 0, tax: Store.settings().defaultTax || 0, ...data });
    EditorView.renderItems();
    EditorView.recompute();
  },

  removeLine(id) {
    EditorView.current.items = EditorView.current.items.filter(i => i.id !== id);
    if (EditorView.current.items.length === 0) EditorView.addLine();
    EditorView.renderItems();
    EditorView.recompute();
  },

  addProductFromCatalog() {
    const products = Store.products();
    if (products.length === 0) {
      UI.confirm("No products in catalog yet. Add one now?", () => {
        ProductsView.openForm(null, (p) => { EditorView.addLine({ name: p.name, desc: p.description, price: p.price, tax: p.taxRate || 0 }); UI.toast("Product added"); });
      });
      return;
    }
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <input id="prodSearch" placeholder="🔍 Search products..." class="field mb-3">
      <div id="prodList" class="divider-y border border-gray-200 rounded-md max-h-80 overflow-y-auto"></div>
    `;
    const draw = (q = "") => {
      const list = products.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()) || (p.sku || "").toLowerCase().includes(q.toLowerCase()));
      $("prodList").innerHTML = list.length === 0
        ? `<div class="p-6 text-center text-sm text-gray-500">No products found.</div>`
        : list.map(p => `
          <div class="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center" onclick="EditorView.pickProduct('${p.id}')">
            <div>
              <div class="font-medium">${Utils.escapeHtml(p.name)}</div>
              <div class="text-xs text-gray-500">${Utils.escapeHtml(p.description || "")} ${p.sku ? "· " + Utils.escapeHtml(p.sku) : ""}</div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium">${Utils.fmt(p.price)}</div>
              <div class="text-xs text-gray-500">${p.taxRate ? "Tax " + p.taxRate + "%" : ""}</div>
            </div>
          </div>
        `).join("");
    };
    UI.openModal({
      title: "Add Product from Catalog",
      body: wrap,
      footer: [UI.btn("Done", UI.closeModal, "btn btn-ghost")]
    });
    setTimeout(() => { draw(); $("prodSearch").addEventListener("input", e => draw(e.target.value)); $("prodSearch").focus(); }, 0);
  },

  pickProduct(id) {
    const p = Store.getProduct(id);
    if (!p) return;
    EditorView.addLine({ name: p.name, desc: p.description, price: p.price, tax: p.taxRate || 0 });
    UI.closeModal();
  },

  renderItems() {
    const tbody = $("itemsBody");
    tbody.innerHTML = "";
    EditorView.current.items.forEach(it => {
      const tr = document.createElement("tr");
      tr.className = "line-row border-b border-gray-100";
      tr.innerHTML = `
        <td><input data-k="name" placeholder="Product name" value="${Utils.escapeHtml(it.name)}"></td>
        <td><input data-k="desc" placeholder="Description" value="${Utils.escapeHtml(it.desc || "")}"></td>
        <td><input data-k="qty" type="number" step="any" min="0" value="${it.qty || 0}" class="num-right"></td>
        <td><input data-k="price" type="number" step="any" min="0" value="${it.price || 0}" class="num-right"></td>
        <td><input data-k="disc" type="number" step="any" min="0" max="100" value="${it.disc || 0}" class="num-right"></td>
        <td><input data-k="tax" type="number" step="any" min="0" value="${it.tax || 0}" class="num-right"></td>
        <td class="num-right font-medium" data-cell="amount">—</td>
        <td class="text-center"><button type="button" class="btn-danger rounded-full w-7 h-7 text-xs" title="Remove">✕</button></td>
      `;
      tr.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", () => {
          const key = input.dataset.k;
          it[key] = input.type === "number" ? +input.value : input.value;
          EditorView.recompute();
        });
      });
      tr.querySelector("button").addEventListener("click", () => EditorView.removeLine(it.id));
      tbody.appendChild(tr);
    });
  },

  recompute() {
    const inv = EditorView.current;
    const t = Utils.computeTotals(inv);
    inv.items.forEach((it, i) => {
      const row = $("itemsBody").children[i];
      if (row) row.querySelector('[data-cell="amount"]').textContent = Utils.fmt(it._amount);
    });
    $("sumSub").textContent = Utils.fmt(t.subtotal);
    $("sumLineDisc").textContent = Utils.fmt(t.lineDiscount);
    $("sumTax").textContent = Utils.fmt(t.tax);
    $("sumTotal").textContent = Utils.fmt(t.total);
    $("sumDue").textContent = Utils.fmt(t.balance);
  },

  // ===== Payments =====
  renderPayments() {
    const inv = EditorView.current;
    const list = inv.payments || [];
    const el = $("paymentsList");
    if (list.length === 0) {
      el.innerHTML = `<div class="text-xs text-gray-500 italic py-2">No payments recorded yet.</div>`;
      return;
    }
    el.innerHTML = list.map(p => `
      <div class="flex justify-between items-center py-2">
        <div>
          <div>${Utils.fmt(p.amount)} · <span class="text-xs text-gray-500">${Utils.escapeHtml(p.method || "Payment")}</span></div>
          <div class="text-xs text-gray-500">${Utils.fmtDate(p.date)} ${p.note ? "· " + Utils.escapeHtml(p.note) : ""}</div>
        </div>
        <button class="btn btn-danger btn-sm" onclick="EditorView.removePayment('${p.id}')">✕</button>
      </div>
    `).join("");
  },

  addPaymentDialog() {
    const t = Utils.computeTotals(EditorView.current);
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Amount</label><input id="payAmt" type="number" step="any" min="0" value="${t.balance.toFixed(2)}" class="field"></div>
        <div><label class="label">Date</label><input id="payDate" type="date" value="${Utils.todayStr()}" class="field"></div>
        <div><label class="label">Method</label>
          <select id="payMethod" class="field">
            <option>Bank Transfer</option><option>Cash</option><option>Credit Card</option>
            <option>QRIS</option><option>E-Wallet</option><option>Other</option>
          </select>
        </div>
        <div><label class="label">Reference / Note</label><input id="payNote" class="field" placeholder="e.g. BCA-12345"></div>
      </div>
    `;
    UI.openModal({
      title: "Record Payment",
      body: wrap,
      footer: [
        UI.btn("Cancel", UI.closeModal, "btn btn-ghost"),
        UI.btn("Save Payment", () => {
          const amount = +$("payAmt").value || 0;
          if (amount <= 0) { UI.toast("Enter a positive amount", "error"); return; }
          EditorView.current.payments = EditorView.current.payments || [];
          EditorView.current.payments.push({
            id: Utils.uid(),
            amount, date: $("payDate").value, method: $("payMethod").value, note: $("payNote").value
          });
          UI.closeModal();
          EditorView.renderPayments();
          EditorView.recompute();
          // auto-update status
          const newT = Utils.computeTotals(EditorView.current);
          if (newT.balance <= 0.0001) EditorView.current.status = "Paid";
          else if (newT.paid > 0) EditorView.current.status = "Partial";
          $("fStatus").value = EditorView.current.status;
          UI.toast("Payment recorded", "success");
        }, "btn btn-success")
      ]
    });
  },

  removePayment(pid) {
    EditorView.current.payments = (EditorView.current.payments || []).filter(p => p.id !== pid);
    EditorView.renderPayments();
    EditorView.recompute();
  },

  // ===== Save =====
  validate() {
    const inv = EditorView.current;
    if (!inv.invNumber) return "Invoice number is required";
    if (!inv.invDate) return "Invoice date is required";
    if (!inv.clientId) return "Please select a client";
    if (!inv.items.some(i => i.name || (+i.qty && +i.price))) return "Add at least one line item";
    return null;
  },

  save(andNew = false) {
    const err = EditorView.validate();
    if (err) { UI.toast(err, "error"); return; }
    const wasNew = EditorView.isNew;
    const saved = Store.saveInvoice(EditorView.current);
    if (wasNew) Store.bumpInvoiceNumber();
    UI.toast("Invoice saved", "success");
    App.refreshBadges();
    if (andNew) {
      location.hash = "#/invoices/new";
    } else {
      location.hash = `#/invoices/${saved.id}/preview`;
    }
  },

  preview() {
    const err = EditorView.validate();
    if (err) { UI.toast(err, "error"); return; }
    const wasNew = EditorView.isNew;
    const saved = Store.saveInvoice(EditorView.current);
    if (wasNew) Store.bumpInvoiceNumber();
    location.hash = `#/invoices/${saved.id}/preview`;
  }
};
