// ============== Clients ==============
const ClientsView = {
  state: { search: "" },

  render() {
    UI.setTitle("Clients", "Workspace");
    UI.setTopActions([
      UI.btn("＋ New Client", () => ClientsView.openForm(), "btn btn-primary")
    ]);

    const view = $("view");
    view.innerHTML = `
      <div class="p-6 max-w-7xl mx-auto">
        <div class="card card-elev">
          <div class="flex flex-wrap gap-3 items-center mb-4">
            <input id="clSearch" placeholder="🔍 Search clients..." class="field" style="max-width:320px">
            <span id="clCount" class="text-sm text-gray-500 ml-auto"></span>
          </div>
          <div id="clTable" class="scroll-x"></div>
        </div>
      </div>
    `;
    $("clSearch").value = ClientsView.state.search;
    $("clSearch").addEventListener("input", Utils.debounce(e => { ClientsView.state.search = e.target.value; ClientsView.renderTable(); }, 200));
    ClientsView.renderTable();
  },

  renderTable() {
    const q = ClientsView.state.search.toLowerCase();
    let list = Store.clients();
    if (q) list = list.filter(c => (c.name || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q) || (c.phone || "").toLowerCase().includes(q));
    list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    $("clCount").textContent = `${list.length} client${list.length !== 1 ? "s" : ""}`;

    const counts = {};
    Store.invoices().forEach(inv => { counts[inv.clientId] = (counts[inv.clientId] || 0) + 1; });

    $("clTable").innerHTML = list.length === 0 ? `
      <div class="tbl-empty">
        <p>No clients yet.</p>
        <button class="btn btn-primary mt-3" onclick="ClientsView.openForm()">＋ Add your first client</button>
      </div>
    ` : `
      <table class="tbl">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th class="num-right"># Invoices</th><th></th></tr></thead>
        <tbody>
          ${list.map(c => `
            <tr>
              <td class="font-medium">${Utils.escapeHtml(c.name)}</td>
              <td>${Utils.escapeHtml(c.email || "")}</td>
              <td>${Utils.escapeHtml(c.phone || "")}</td>
              <td class="text-xs text-gray-600">${Utils.escapeHtml((c.address || "").slice(0, 60))}</td>
              <td class="num-right">${counts[c.id] || 0}</td>
              <td class="text-right">
                <button class="btn btn-ghost btn-sm" onclick="ClientsView.openForm('${c.id}')">Edit</button>
                <button class="btn btn-soft btn-sm" onclick="ClientsView.newInvoice('${c.id}')">+ Invoice</button>
                <button class="btn btn-danger btn-sm" onclick="ClientsView.remove('${c.id}')">✕</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  },

  openForm(id, onSaved) {
    const c = id ? Store.getClient(id) : { name: "", email: "", phone: "", address: "", taxId: "", notes: "" };
    if (!c) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="grid grid-cols-1 gap-3">
        <div><label class="label">Name *</label><input id="cfName" class="field" value="${Utils.escapeHtml(c.name)}"></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="label">Email</label><input id="cfEmail" class="field" value="${Utils.escapeHtml(c.email || "")}"></div>
          <div><label class="label">Phone</label><input id="cfPhone" class="field" value="${Utils.escapeHtml(c.phone || "")}"></div>
        </div>
        <div><label class="label">Address</label><textarea id="cfAddr" class="field" rows="3">${Utils.escapeHtml(c.address || "")}</textarea></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="label">Tax ID / NPWP</label><input id="cfTax" class="field" value="${Utils.escapeHtml(c.taxId || "")}"></div>
          <div><label class="label">Contact Person</label><input id="cfContact" class="field" value="${Utils.escapeHtml(c.contact || "")}"></div>
        </div>
        <div><label class="label">Notes</label><textarea id="cfNotes" class="field" rows="2">${Utils.escapeHtml(c.notes || "")}</textarea></div>
      </div>
    `;
    UI.openModal({
      title: id ? "Edit Client" : "New Client",
      body: wrap,
      footer: [
        UI.btn("Cancel", UI.closeModal, "btn btn-ghost"),
        UI.btn("Save Client", () => {
          const name = $("cfName").value.trim();
          if (!name) { UI.toast("Name is required", "error"); return; }
          const saved = Store.saveClient({
            id: c.id, name,
            email: $("cfEmail").value.trim(),
            phone: $("cfPhone").value.trim(),
            address: $("cfAddr").value.trim(),
            taxId: $("cfTax").value.trim(),
            contact: $("cfContact").value.trim(),
            notes: $("cfNotes").value.trim(),
            createdAt: c.createdAt
          });
          UI.toast("Client saved", "success");
          UI.closeModal();
          if (location.hash.startsWith("#/clients")) ClientsView.renderTable();
          if (onSaved) onSaved(saved.id);
        }, "btn btn-primary")
      ]
    });
    setTimeout(() => $("cfName").focus(), 0);
  },

  remove(id) {
    const c = Store.getClient(id);
    if (!c) return;
    const used = Store.invoices().some(inv => inv.clientId === id);
    if (used) { UI.toast("This client has invoices and cannot be deleted.", "error"); return; }
    UI.confirm(`Delete client "${c.name}"?`, () => {
      Store.deleteClient(id);
      UI.toast("Client deleted", "success");
      ClientsView.renderTable();
    }, { yesLabel: "Delete", danger: true });
  },

  newInvoice(clientId) {
    location.hash = `#/invoices/new?client=${clientId}`;
  }
};
