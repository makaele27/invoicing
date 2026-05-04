// ============== Dashboard ==============
const DashboardView = {
  render() {
    UI.setTitle("Dashboard", "Workspace");
    UI.setTopActions([
      UI.btn("+ New Invoice", () => location.hash = "#/invoices/new", "btn btn-primary")
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

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="stat-card">
            <div class="stat-icon"><i data-lucide="trending-up" width="22" height="22"></i></div>
            <div class="stat-label">Total Revenue</div>
            <div class="stat-value" style="color:var(--color-teal-dark)">${Utils.fmt(totalRevenue)}</div>
            <div class="stat-sub">${invs.length} total invoice${invs.length !== 1 ? 's' : ''}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i data-lucide="clock" width="22" height="22"></i></div>
            <div class="stat-label">Outstanding</div>
            <div class="stat-value" style="color:var(--color-ristretto)">${Utils.fmt(outstanding)}</div>
            <div class="stat-sub">across active invoices</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i data-lucide="alert-circle" width="22" height="22"></i></div>
            <div class="stat-label">Overdue</div>
            <div class="stat-value" style="color:#8b2e1a">${Utils.fmt(overdue)}</div>
            <div class="stat-sub">past due date</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i data-lucide="calendar" width="22" height="22"></i></div>
            <div class="stat-label">This Month</div>
            <div class="stat-value">${Utils.fmt(monthRevenue)}</div>
            <div class="stat-sub">${monthKey}</div>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-4">
          <div class="card card-elev lg:col-span-2">
            <div class="flex justify-between items-center mb-4">
              <h3 style="font-family:var(--font-serif);font-size:18px;font-weight:400;color:var(--color-espresso);margin:0;">Recent Invoices</h3>
              <a href="#/invoices" style="font-family:var(--font-accent);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--color-teal);text-decoration:none;">View all →</a>
            </div>
            ${recent.length === 0 ? `
              <div class="tbl-empty">
                <p style="margin-bottom:16px;">No invoices yet.</p>
                <button class="btn btn-primary" onclick="location.hash='#/invoices/new'">+ Create your first invoice</button>
                <button class="btn btn-soft ml-2" onclick="DashboardView.seedDemo()">Load sample data</button>
              </div>
            ` : `
              <div class="scroll-x">
                <table class="tbl">
                  <thead><tr>
                    <th>Invoice</th><th>Client</th><th>Date</th>
                    <th class="num-right">Total</th><th>Status</th><th></th>
                  </tr></thead>
                  <tbody>
                    ${recent.map(inv => {
                      const cl = Store.getClient(inv.clientId) || { name: inv.clName || "—" };
                      const t = Utils.computeTotals(inv);
                      const st = Utils.computeStatus(inv);
                      return `<tr>
                        <td><a href="#/invoices/${inv.id}" class="tbl-link">${Utils.escapeHtml(inv.invNumber)}</a></td>
                        <td style="color:var(--color-ristretto)">${Utils.escapeHtml(cl.name)}</td>
                        <td style="color:var(--color-cappuccino)">${Utils.fmtDate(inv.invDate)}</td>
                        <td class="num-right" style="font-family:var(--font-serif);font-size:14px;">${Utils.fmt(t.total)}</td>
                        <td>${Utils.statusPill(st)}</td>
                        <td><a href="#/invoices/${inv.id}" class="btn btn-ghost btn-sm">Open</a></td>
                      </tr>`;
                    }).join("")}
                  </tbody>
                </table>
              </div>
            `}
          </div>

          <div class="card card-elev">
            <h3 style="font-family:var(--font-serif);font-size:18px;font-weight:400;color:var(--color-espresso);margin:0 0 16px;">Quick Actions</h3>
            <div class="grid gap-2">
              <button class="btn btn-primary justify-center" onclick="location.hash='#/invoices/new'">+ New Invoice</button>
              <button class="btn btn-soft justify-center" onclick="location.hash='#/clients'">Manage Clients (${Store.clients().length})</button>
              <button class="btn btn-soft justify-center" onclick="location.hash='#/products'">Product Catalog (${Store.products().length})</button>
              <button class="btn btn-ghost justify-center" onclick="location.hash='#/settings'">Company Settings</button>
              <button class="btn btn-ghost justify-center" onclick="location.hash='#/backup'">Backup / Restore</button>
            </div>
            <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--color-border-light);font-size:11px;color:var(--color-cappuccino);font-family:var(--font-accent);letter-spacing:0.06em;line-height:1.6;">
              Data is stored locally in your browser. Use Backup regularly to protect your records.
            </div>
          </div>
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  seedDemo() {
    UI.confirm("Load sample clients, products, and one invoice?", () => {
      Store.seedDemo();
      UI.toast("Sample data loaded", "success");
      DashboardView.render();
    });
  }
};
