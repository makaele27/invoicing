// ============== Backup / Restore ==============
const BackupView = {
  render() {
    UI.setTitle("Backup & Restore", "Workspace");
    UI.setTopActions([]);

    const s = Store._data();
    const counts = {
      invoices: s.invoices.length,
      clients: s.clients.length,
      products: s.products.length,
    };

    const view = $("view");
    view.innerHTML = `
      <div class="p-6 max-w-3xl mx-auto space-y-6">

        <div class="card card-elev">
          <h3 class="section-title">Export Data</h3>
          <p class="text-sm text-gray-600 mb-3">Download a JSON backup of all your invoices, clients, products, and settings. Keep it safe—you can restore from it later.</p>
          <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="stat-card"><div class="stat-label">Invoices</div><div class="stat-value">${counts.invoices}</div></div>
            <div class="stat-card"><div class="stat-label">Clients</div><div class="stat-value">${counts.clients}</div></div>
            <div class="stat-card"><div class="stat-label">Products</div><div class="stat-value">${counts.products}</div></div>
          </div>
          <button class="btn btn-success" onclick="BackupView.exportData()">⬇ Download backup (.json)</button>
          <button class="btn btn-soft ml-2" onclick="BackupView.exportInvoicesCSV()">⬇ Invoices as CSV</button>
        </div>

        <div class="card card-elev">
          <h3 class="section-title">Import Data</h3>
          <p class="text-sm text-gray-600 mb-3">Restore from a previously exported JSON file. <strong class="text-red-600">This will replace ALL current data.</strong></p>
          <input type="file" id="impFile" accept=".json" class="hidden">
          <button class="btn btn-warning" onclick="document.getElementById('impFile').click()">📂 Select backup file</button>
        </div>

        <div class="card card-elev border-red-200">
          <h3 class="section-title text-red-600">Danger Zone</h3>
          <p class="text-sm text-gray-600 mb-3">Erase all data and start fresh. This cannot be undone.</p>
          <button class="btn btn-danger" onclick="BackupView.factoryReset()">🗑 Reset all data</button>
          <button class="btn btn-soft ml-2" onclick="BackupView.seedDemo()">⭐ Load sample data</button>
        </div>

      </div>
    `;

    $("impFile").addEventListener("change", async e => {
      const f = e.target.files[0]; if (!f) return;
      const txt = await Utils.readFile(f, false);
      UI.confirm(`Replace all current data with ${f.name}?`, () => {
        try {
          Store.importAll(txt);
          UI.toast("Data restored", "success");
          App.refreshBadges();
          BackupView.render();
        } catch (err) {
          UI.toast("Import failed: " + err.message, "error");
        }
      }, { yesLabel: "Replace", danger: true });
    });
  },

  exportData() {
    const json = Store.exportAll();
    const date = Utils.todayStr();
    Utils.download(`mallo-invoicing-backup-${date}.json`, json, "application/json");
    UI.toast("Backup downloaded", "success");
  },

  exportInvoicesCSV() {
    const rows = [["Number", "Date", "Due", "Client", "Status", "Subtotal", "Tax", "Total", "Paid", "Balance"]];
    Store.invoices().forEach(inv => {
      const c = Store.getClient(inv.clientId) || {};
      const t = Utils.computeTotals(inv);
      rows.push([
        inv.invNumber, inv.invDate, inv.invDue, c.name || "",
        Utils.computeStatus(inv),
        t.subtotal.toFixed(2), t.tax.toFixed(2), t.total.toFixed(2), t.paid.toFixed(2), t.balance.toFixed(2)
      ]);
    });
    const csv = rows.map(r => r.map(cell => {
      const s = String(cell ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",")).join("\n");
    Utils.download(`invoices-${Utils.todayStr()}.csv`, csv, "text/csv");
    UI.toast("CSV downloaded", "success");
  },

  factoryReset() {
    UI.confirm("Erase ALL data permanently? This cannot be undone.", () => {
      Store.reset();
      UI.toast("All data erased", "success");
      App.refreshBadges();
      location.hash = "#/dashboard";
    }, { yesLabel: "Erase everything", danger: true });
  },

  seedDemo() {
    UI.confirm("Add sample clients, products, and one invoice to your existing data?", () => {
      Store.seedDemo();
      UI.toast("Sample data added", "success");
      App.refreshBadges();
      BackupView.render();
    });
  }
};
