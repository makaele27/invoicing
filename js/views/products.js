// ============== Products ==============
const ProductsView = {
  state: { search: "" },

  render() {
    UI.setTitle("Products", "Workspace");
    UI.setTopActions([
      UI.btn("＋ New Product", () => ProductsView.openForm(), "btn btn-primary")
    ]);

    const view = $("view");
    view.innerHTML = `
      <div class="p-6 max-w-7xl mx-auto">
        <div class="card card-elev">
          <div class="flex flex-wrap gap-3 items-center mb-4">
            <input id="prSearch" placeholder="🔍 Search products..." class="field" style="max-width:320px">
            <span id="prCount" class="text-sm text-gray-500 ml-auto"></span>
          </div>
          <div id="prTable" class="scroll-x"></div>
        </div>
      </div>
    `;
    $("prSearch").value = ProductsView.state.search;
    $("prSearch").addEventListener("input", Utils.debounce(e => { ProductsView.state.search = e.target.value; ProductsView.renderTable(); }, 200));
    ProductsView.renderTable();
  },

  renderTable() {
    const q = ProductsView.state.search.toLowerCase();
    let list = Store.products();
    if (q) list = list.filter(p => (p.name || "").toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
    list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    $("prCount").textContent = `${list.length} product${list.length !== 1 ? "s" : ""}`;

    $("prTable").innerHTML = list.length === 0 ? `
      <div class="tbl-empty">
        <p>No products yet.</p>
        <button class="btn btn-primary mt-3" onclick="ProductsView.openForm()">＋ Add your first product</button>
      </div>
    ` : `
      <table class="tbl">
        <thead><tr><th>Name</th><th>SKU</th><th>Description</th><th class="num-right">Price</th><th class="num-right">Tax %</th><th></th></tr></thead>
        <tbody>
          ${list.map(p => `
            <tr>
              <td class="font-medium">${Utils.escapeHtml(p.name)}</td>
              <td class="text-xs text-gray-500">${Utils.escapeHtml(p.sku || "")}</td>
              <td class="text-xs text-gray-600">${Utils.escapeHtml((p.description || "").slice(0, 80))}</td>
              <td class="num-right">${Utils.fmt(p.price)}</td>
              <td class="num-right">${p.taxRate || 0}%</td>
              <td class="text-right">
                <button class="btn btn-ghost btn-sm" onclick="ProductsView.openForm('${p.id}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="ProductsView.remove('${p.id}')">✕</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  },

  openForm(id, onSaved) {
    const p = id ? Store.getProduct(id) : { name: "", sku: "", description: "", price: 0, taxRate: Store.settings().defaultTax || 0 };
    if (!p) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="grid grid-cols-1 gap-3">
        <div><label class="label">Name *</label><input id="pfName" class="field" value="${Utils.escapeHtml(p.name)}"></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="label">SKU</label><input id="pfSku" class="field" value="${Utils.escapeHtml(p.sku || "")}"></div>
          <div><label class="label">Default Tax (%)</label><input id="pfTax" type="number" min="0" step="any" class="field" value="${p.taxRate || 0}"></div>
        </div>
        <div><label class="label">Description</label><textarea id="pfDesc" class="field" rows="2">${Utils.escapeHtml(p.description || "")}</textarea></div>
        <div><label class="label">Unit Price *</label><input id="pfPrice" type="number" min="0" step="any" class="field" value="${p.price || 0}"></div>
      </div>
    `;
    UI.openModal({
      title: id ? "Edit Product" : "New Product",
      body: wrap,
      footer: [
        UI.btn("Cancel", UI.closeModal, "btn btn-ghost"),
        UI.btn("Save", () => {
          const name = $("pfName").value.trim();
          if (!name) { UI.toast("Name is required", "error"); return; }
          const saved = Store.saveProduct({
            id: p.id, name,
            sku: $("pfSku").value.trim(),
            description: $("pfDesc").value.trim(),
            price: +$("pfPrice").value || 0,
            taxRate: +$("pfTax").value || 0,
            createdAt: p.createdAt
          });
          UI.toast("Product saved", "success");
          UI.closeModal();
          if (location.hash.startsWith("#/products")) ProductsView.renderTable();
          if (onSaved) onSaved(saved);
        }, "btn btn-primary")
      ]
    });
    setTimeout(() => $("pfName").focus(), 0);
  },

  remove(id) {
    const p = Store.getProduct(id);
    if (!p) return;
    UI.confirm(`Delete product "${p.name}"? Existing invoices will be unaffected.`, () => {
      Store.deleteProduct(id);
      UI.toast("Product deleted", "success");
      ProductsView.renderTable();
    }, { yesLabel: "Delete", danger: true });
  }
};
