// ============== Store ==============
const STORAGE_KEY = "mallo_invoicing_v1";

const Store = (() => {
  const defaultData = () => ({
    settings: {
      companyName: "Pasta Sisilia Graha",
      companyAddress: "Jl. Cikatomas II No. 29 Jakarta Selatan, Kota Jakarta Selatan, DKI Jakarta",
      companyPhone: "6281282001866",
      companyEmail: "kpwahjudi@gmail.com",
      companyTaxId: "",
      logo: null,
      signature: null,
      currency: "Rp",
      defaultTax: 0,
      defaultPaymentDays: 14,
      invoicePrefix: "INV/2026/",
      invoiceNextNumber: 1,
      invoicePadding: 4,
      defaultTerms: "Transfer ke Account\nBank Central Asia\nHALYA DWANITZA GREESLAMI\nA/N: 7310680685",
      defaultNotes: "",
    },
    clients: [],
    products: [],
    invoices: [],
    sequence: { invoice: 1 }
  });

  let data = null;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        data = defaultData();
        save();
        return;
      }
      const parsed = JSON.parse(raw);
      // shallow merge defaults to fill any new keys
      const def = defaultData();
      data = {
        ...def, ...parsed,
        settings: { ...def.settings, ...(parsed.settings || {}) },
        sequence: { ...def.sequence, ...(parsed.sequence || {}) },
        clients: parsed.clients || [],
        products: parsed.products || [],
        invoices: parsed.invoices || []
      };
    } catch (e) {
      console.error("Failed to load store", e);
      data = defaultData();
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Storage save failed", e);
      UI && UI.toast("Storage error: " + e.message, "error");
    }
  }

  function settings() { return data.settings; }
  function updateSettings(patch) { Object.assign(data.settings, patch); save(); }

  // ===== Clients =====
  function clients() { return data.clients; }
  function getClient(id) { return data.clients.find(c => c.id === id); }
  function saveClient(client) {
    if (client.id) {
      const i = data.clients.findIndex(c => c.id === client.id);
      if (i >= 0) data.clients[i] = client;
    } else {
      client.id = Utils.uid();
      client.createdAt = Date.now();
      data.clients.push(client);
    }
    save();
    return client;
  }
  function deleteClient(id) {
    data.clients = data.clients.filter(c => c.id !== id);
    save();
  }

  // ===== Products =====
  function products() { return data.products; }
  function getProduct(id) { return data.products.find(p => p.id === id); }
  function saveProduct(p) {
    if (p.id) {
      const i = data.products.findIndex(x => x.id === p.id);
      if (i >= 0) data.products[i] = p;
    } else {
      p.id = Utils.uid();
      p.createdAt = Date.now();
      data.products.push(p);
    }
    save();
    return p;
  }
  function deleteProduct(id) {
    data.products = data.products.filter(p => p.id !== id);
    save();
  }

  // ===== Invoices =====
  function invoices() { return data.invoices; }
  function getInvoice(id) { return data.invoices.find(i => i.id === id); }

  function nextInvoiceNumber() {
    const s = data.settings;
    const num = String(s.invoiceNextNumber || 1).padStart(s.invoicePadding || 4, "0");
    return (s.invoicePrefix || "") + num;
  }

  function bumpInvoiceNumber() {
    data.settings.invoiceNextNumber = (+data.settings.invoiceNextNumber || 1) + 1;
    save();
  }

  function saveInvoice(inv) {
    inv.updatedAt = Date.now();
    if (inv.id) {
      const i = data.invoices.findIndex(x => x.id === inv.id);
      if (i >= 0) data.invoices[i] = inv;
      else data.invoices.push(inv);
    } else {
      inv.id = Utils.uid();
      inv.createdAt = Date.now();
      data.invoices.push(inv);
    }
    save();
    return inv;
  }

  function deleteInvoice(id) {
    data.invoices = data.invoices.filter(i => i.id !== id);
    save();
  }

  function addPayment(invoiceId, payment) {
    const inv = getInvoice(invoiceId);
    if (!inv) return;
    inv.payments = inv.payments || [];
    payment.id = Utils.uid();
    payment.date = payment.date || Utils.todayStr();
    inv.payments.push(payment);
    inv.updatedAt = Date.now();
    save();
  }

  function deletePayment(invoiceId, paymentId) {
    const inv = getInvoice(invoiceId);
    if (!inv) return;
    inv.payments = (inv.payments || []).filter(p => p.id !== paymentId);
    save();
  }

  // ===== Bulk =====
  function exportAll() {
    return JSON.stringify(data, null, 2);
  }
  function importAll(json) {
    const parsed = typeof json === "string" ? JSON.parse(json) : json;
    if (!parsed || typeof parsed !== "object") throw new Error("Invalid backup file");
    const def = defaultData();
    data = {
      ...def, ...parsed,
      settings: { ...def.settings, ...(parsed.settings || {}) },
      clients: parsed.clients || [],
      products: parsed.products || [],
      invoices: parsed.invoices || []
    };
    save();
  }
  function reset() {
    data = defaultData();
    save();
  }

  function seedDemo() {
    // Sample clients
    const c1 = saveClient({ name: "Hal's Cookies", email: "hal@example.com", phone: "6287876969204", address: "Jl. Sudirman No. 12, Jakarta", taxId: "" });
    const c2 = saveClient({ name: "Kopi Jaya Abadi", email: "info@kopijaya.id", phone: "6281234567890", address: "Jl. Asia Afrika 45, Bandung", taxId: "" });
    const c3 = saveClient({ name: "Toko Bahagia Sentosa", email: "order@bahagia.co.id", phone: "6281122334455", address: "Jl. Diponegoro 88, Surabaya", taxId: "" });

    // Sample products
    saveProduct({ name: "Pasta Carbonara", description: "Classic Italian carbonara", price: 65000, taxRate: 10, sku: "PC-001" });
    saveProduct({ name: "Pasta Bolognese", description: "Slow-cooked beef ragù", price: 70000, taxRate: 10, sku: "PB-001" });
    saveProduct({ name: "Pasta Aglio Olio", description: "Garlic & olive oil", price: 55000, taxRate: 10, sku: "PA-001" });
    saveProduct({ name: "Tiramisu", description: "Classic dessert", price: 45000, taxRate: 10, sku: "DS-001" });
    saveProduct({ name: "Boxes of 2 Cookies", description: "Hal's Cookies", price: 30000, taxRate: 0, sku: "HC-002" });
    saveProduct({ name: "Boxes of 6 Cookies", description: "Hal's Cookies", price: 85000, taxRate: 0, sku: "HC-006" });

    // Sample invoice
    const inv = {
      invNumber: nextInvoiceNumber(),
      invDate: Utils.todayStr(),
      invDue: Utils.addDays(Utils.todayStr(), 14),
      invRef: "WIC-2025",
      invSales: "Kelvin Wahjudi",
      status: "Sent",
      clientId: c1.id,
      items: [
        { id: Utils.uid(), name: "Boxes of 2", desc: "Hal's Cookies", qty: 19, price: 30000, disc: 0, tax: 0 },
        { id: Utils.uid(), name: "Boxes of 6", desc: "Hal's Cookies", qty: 30, price: 85000, disc: 0, tax: 0 },
        { id: Utils.uid(), name: "Gavin", desc: "Donation", qty: 1, price: 500000, disc: 0, tax: 0 },
      ],
      addDisc: 0, addDiscType: "rp", delivery: 0,
      notes: "Hal's Cookies\nRevenue Sharing\nWIC Bazaar 2025",
      terms: settings().defaultTerms,
      payments: []
    };
    saveInvoice(inv);
    bumpInvoiceNumber();
  }

  load();

  return {
    settings, updateSettings,
    clients, getClient, saveClient, deleteClient,
    products, getProduct, saveProduct, deleteProduct,
    invoices, getInvoice, saveInvoice, deleteInvoice,
    addPayment, deletePayment,
    nextInvoiceNumber, bumpInvoiceNumber,
    exportAll, importAll, reset, seedDemo,
    _data: () => data,
  };
})();
