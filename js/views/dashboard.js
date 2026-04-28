// ============== Dashboard ==============
const DashboardView = {
  render() {
    UI.setTitle("Dashboard", "Workspace");
    UI.setTopActions([
      UI.btn("＋ New Invoice", () => location.hash = "#/invoices/new", "btn btn-primary")
    ]);

    const invs = Store.invoices();
    let totalRevenue = 0, outstanding = 0, overdue = 0, monthRevenue = 0;
    const today = new Date(Utils.todayStr());
    const monthKey = today.toISOString().slice(0, 7);

    invs.forEach(inv => {
      if (inv.status === "Cancelled" || inv.status === "Draft") return;
      const t = Utils.computeTotals(inv);
      totalRevenue += t.paid;
      outstanding += t.balance;
      const status = Utils.computeStatus(inv);
      if (status === "Overdue") overdue += t.balance;
      if (inv.invDate && inv.invDate.slice(0, 7) === monthKey) monthRevenue += t.total;
    });

    const recent = invs.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 6);

    const view = $("view");
    view.innerHTML = `
      <div class="p-6 max-w-7xl mx-auto">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-label">Total Revenue (Paid)</div>
            <div class="stat-value text-green-600">${Utils.fmt(totalRevenue)}</div>
            <div class="stat-sub">${invs.length} total invoices</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-label">Outstanding</div>
            <div class="stat-value text-blue-600">${Utils.fmt(outstanding)}</div>
            <div class="stat-sub">across active invoices</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⚠️</div>
            <div class="stat-label">Overdue</div>
            <div class="stat-value text-red-600">${Utils.fmt(overdue)}</div>
            <div class="stat-sub">payment past due date</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-label">This Month</div>
            <div class="stat-value">${Utils.fmt(monthRevenue)}</div>
            <div class="stat-sub">${monthKey}</div>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-4 mt-6">
          <div class="card card-elev lg:col-span-2">
            <div class="flex justify-between items-center mb-3">
              <h3 class="font-semibold">Recent Invoices</h3>
              <a href="#/invoices" class="text-xs text-blue-600 hover:underline">View all →</a>
            </div>
            ${recent.length === 0 ? `
              <div class="tbl-empty">
                <p>No invoices yet.</p>
                <button class="btn btn-primary mt-3" onclick="location.hash='#/invoices/new'">＋ Create your first invoice</button>
                <button class="btn btn-soft mt-3 ml-2" onclick="DashboardView.seedDemo()">⭐ Load sample data</button>
              </div>
            ` : `
              <table class="tbl">
                <thead><tr><th>Invoice</th><th>Client</th><th>Date</th><th class="num-right">Total</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  ${recent.map(inv => {
                    const cl = Store.getClient(inv.clientId) || { name: inv.clName || "—" };
                    const t = Utils.computeTotals(inv);
                    const st = Utils.computeStatus(inv);
                    return `<tr>
                      <td><a href="#/invoices/${inv.id}" class="text-blue-600 hover:underline">${Utils.escapeHtml(inv.invNumber)}</a></td>
                      <td>${Utils.escapeHtml(cl.name)}</td>
                      <td>${Utils.fmtDate(inv.invDate)}</td>
                      <td class="num-right">${Utils.fmt(t.total)}</td>
                      <td>${Utils.statusPill(st)}</td>
                      <td><a href="#/invoices/${inv.id}" class="btn btn-ghost btn-sm">Open</a></td>
                    </tr>`;
                  }).join("")}
                </tbody>
              </table>
            `}
          </div>

          <div class="card card-elev">
            <h3 class="font-semibold mb-3">Quick Actions</h3>
            <div class="grid gap-2">
              <button class="btn btn-primary justify-center" onclick="location.hash='#/invoices/new'">＋ New Invoice</button>
              <button class="btn btn-soft justify-center" onclick="location.hash='#/clients'">👥 Manage Clients (${Store.clients().length})</button>
              <button class="btn btn-soft justify-center" onclick="location.hash='#/products'">📦 Product Catalog (${Store.products().length})</button>
              <button class="btn btn-ghost justify-center" onclick="location.hash='#/settings'">⚙️ Company Settings</button>
              <button class="btn btn-ghost justify-center" onclick="location.hash='#/backup'">💾 Backup / Restore</button>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
              Data is stored locally in your browser. Use Backup regularly to protect your records.
            </div>
          </div>
        </div>
      </div>
    `;
  },

  seedDemo() {
    UI.confirm("Load sample clients, products, and one invoice?", () => {
      Store.seedDemo();
      UI.toast("Sample data loaded", "success");
      DashboardView.render();
    });
  }
};
