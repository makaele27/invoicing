// ============== Invoices List ==============
const InvoicesView = {
  state: { search: "", status: "all", sort: "date_desc" },

  render() {
    UI.setTitle("Invoices", "Workspace");
    UI.setTopActions([
      UI.btn("+ New Invoice", () => location.hash = "#/invoices/new", "btn btn-primary")
    ]);

    const view = $("view");
    view.innerHTML = `
      <div class="p-6 max-w-7xl mx-auto">
        <div class="card card-elev">
          <div class="flex flex-wrap gap-3 items-center mb-4">
            <input id="invSearch" placeholder="Search by number or client…" class="field" style="max-width:300px"
              value="${Utils.escapeHtml(InvoicesView.state.search)}">
            <select id="invStatusFilter" class="field" style="max-width:160px">
              <option value="all">All statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select id="invSort" class="field" style="max-width:180px">
              <option value="date_desc">Newest first</option>
              <option value="date_asc">Oldest first</option>
              <option value="total_desc">Highest amount</option>
              <option value="total_asc">Lowest amount</option>
              <option value="number_asc">Number A→Z</option>
            </select>
            <span id="invCount" style="font-family:var(--font-accent);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-cappuccino);margin-left:auto;"></span>
          </div>
          <div id="invTable" class="scroll-x"></div>
        </div>
      </div>
    `;

    $("invSearch").value = InvoicesView.state.search;
    $("invStatusFilter").value = InvoicesView.state.status;
    $("invSort").value = InvoicesView.state.sort;

    $("invSearch").addEventListener("input", Utils.debounce(e => {
      InvoicesView.state.search = e.target.value; InvoicesView.renderTable();
    }, 200));
    $("invStatusFilter").addEventListener("change", e => { InvoicesView.state.status = e.target.value; InvoicesView.renderTable(); });
    $("invSort").addEventListener("change", e => { InvoicesView.state.sort = e.target.value; InvoicesView.renderTable(); });

    InvoicesView.renderTable();
  },

  renderTable() {
    const { search, status, sort } = InvoicesView.state;
    let list = Store.invoices().map(inv => {
      const cl = Store.getClient(inv.clientId) || { name: inv.clName || "—" };
      const t = Utils.computeTotals(inv);
      const st = Utils.computeStatus(inv);
      return { inv, cl, t, st };
    });

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(({ inv, cl }) =>
        (inv.invNumber || "").toLowerCase().includes(q) ||
        (cl.name || "").toLowerCase().includes(q)
      );
    }
    if (status !== "all") list = list.filter(x => x.st === status);

    list.sort((a, b) => {
      switch (sort) {
        case "date_asc":   return (a.inv.invDate || "").localeCompare(b.inv.invDate || "");
        case "total_desc": return b.t.total - a.t.total;
        case "total_asc":  return a.t.total - b.t.total;
        case "number_asc": return (a.inv.invNumber || "").localeCompare(b.inv.invNumber || "");
        default:           return (b.inv.invDate || "").localeCompare(a.inv.invDate || "");
      }
    });

    $("invCount").textContent = `${list.length} invoice${list.length !== 1 ? "s" : ""}`;

    const html = list.length === 0 ? `
      <div class="tbl-empty">
        <p>No invoices match your filters.</p>
        <button class="btn btn-primary mt-3" onclick="location.hash='#/invoices/new'">+ New invoice</button>
      </div>
    ` : `
      <table class="tbl">
        <thead><tr>
          <th>Invoice</th><th>Client</th><th>Date</th><th>Due</th>
          <th class="num-right">Total</th><th class="num-right">Paid</th><th class="num-right">Balance</th>
          <th>Status</th><th></th>
        </tr></thead>
        <tbody>
          ${list.map(({ inv, cl, t, st }) => `
            <tr>
              <td><a href="#/invoices/${inv.id}" class="tbl-link">${Utils.escapeHtml(inv.invNumber)}</a></td>
              <td style="color:var(--color-ristretto);">${Utils.escapeHtml(cl.name)}</td>
              <td style="color:var(--color-cappuccino);">${Utils.fmtDate(inv.invDate)}</td>
              <td style="color:var(--color-cappuccino);">${Utils.fmtDate(inv.invDue)}</td>
              <td class="num-right" style="font-family:var(--font-serif);font-size:14px;">${Utils.fmt(t.total)}</td>
              <td class="num-right" style="color:var(--color-teal-dark);">${Utils.fmt(t.paid)}</td>
              <td class="num-right" style="color:${t.balance > 0 ? '#8b2e1a' : 'var(--color-teal-dark)'};">${Utils.fmt(t.balance)}</td>
              <td>${Utils.statusPill(st)}</td>
              <td>
                <div style="display:flex;gap:4px;justify-content:flex-end;">
                  <button class="btn btn-ghost btn-sm" onclick="location.hash='#/invoices/${inv.id}'">Open</button>
                  <button class="btn btn-ghost btn-sm" onclick="InvoicesView.duplicate('${inv.id}')">Copy</button>
                  <button class="btn btn-danger btn-sm" onclick="InvoicesView.remove('${inv.id}')">Delete</button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    $("invTable").innerHTML = html;
  },

  duplicate(id) {
    const inv = Store.getInvoice(id);
    if (!inv) return;
    const copy = JSON.parse(JSON.stringify(inv));
    delete copy.id; delete copy.createdAt; delete copy.updatedAt;
    copy.invNumber = Store.nextInvoiceNumber();
    copy.invDate = Utils.todayStr();
    copy.invDue = Utils.addDays(Utils.todayStr(), Store.settings().defaultPaymentDays || 14);
    copy.payments = [];
    copy.status = "Draft";
    Store.saveInvoice(copy);
    Store.bumpInvoiceNumber();
    UI.toast("Invoice duplicated", "success");
    location.hash = `#/invoices/${copy.id}`;
  },

  remove(id) {
    const inv = Store.getInvoice(id);
    if (!inv) return;
    UI.confirm(`Delete invoice ${inv.invNumber}? This cannot be undone.`, () => {
      Store.deleteInvoice(id);
      UI.toast("Invoice deleted", "success");
      InvoicesView.renderTable();
      App.refreshBadges();
    }, { yesLabel: "Delete", danger: true });
  }
};
