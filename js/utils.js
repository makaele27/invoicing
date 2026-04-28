// ============== Utils ==============
const $ = (id) => document.getElementById(id);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const Utils = {
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },

  fmt(n, currencyCode) {
    const code = currencyCode || (Store.settings().currency || "Rp");
    const num = Number(n || 0);
    return code + " " + num.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  },

  fmtNum(n, dp = 2) {
    return Number(n || 0).toLocaleString("id-ID", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  },

  todayStr(d) {
    const x = d || new Date();
    const tz = x.getTimezoneOffset() * 60000;
    return new Date(x - tz).toISOString().slice(0, 10);
  },

  fmtDate(s) {
    if (!s) return "";
    const d = new Date(s);
    if (isNaN(d)) return s;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  },

  daysBetween(a, b) {
    const x = new Date(a), y = new Date(b);
    return Math.floor((y - x) / 86400000);
  },

  addDays(date, days) {
    const d = new Date(date || Date.now());
    d.setDate(d.getDate() + days);
    return Utils.todayStr(d);
  },

  escapeHtml(s) {
    return (s == null ? "" : String(s)).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  },

  computeTotals(invoice) {
    let sub = 0, totalDisc = 0, totalTax = 0;
    (invoice.items || []).forEach(it => {
      const qty = +it.qty || 0;
      const price = +it.price || 0;
      const disc = +it.disc || 0;
      const tax = +it.tax || 0;
      const gross = qty * price;
      const dAmt = gross * disc / 100;
      const net = gross - dAmt;
      const tAmt = net * tax / 100;
      it._gross = gross; it._discAmt = dAmt; it._net = net; it._taxAmt = tAmt; it._amount = net + tAmt;
      sub += gross; totalDisc += dAmt; totalTax += tAmt;
    });
    const addRaw = +invoice.addDisc || 0;
    const addType = invoice.addDiscType || "rp";
    const netBeforeAdd = sub - totalDisc;
    const addDiscAmt = addType === "pct" ? netBeforeAdd * addRaw / 100 : addRaw;
    const delivery = +invoice.delivery || 0;
    const total = netBeforeAdd - addDiscAmt + totalTax + delivery;
    const paid = (invoice.payments || []).reduce((s, p) => s + (+p.amount || 0), 0);
    const balance = total - paid;
    return {
      subtotal: sub,
      totalDiscount: totalDisc + addDiscAmt,
      lineDiscount: totalDisc,
      additionalDiscount: addDiscAmt,
      delivery,
      tax: totalTax,
      total, paid, balance
    };
  },

  computeStatus(invoice) {
    if (invoice.status === "Cancelled") return "Cancelled";
    if (invoice.status === "Draft") return "Draft";
    const t = Utils.computeTotals(invoice);
    if (t.balance <= 0.0001 && t.total > 0) return "Paid";
    if (t.paid > 0 && t.balance > 0) return "Partial";
    if (invoice.invDue && new Date(invoice.invDue) < new Date(Utils.todayStr())) return "Overdue";
    return "Sent";
  },

  statusPill(s) {
    const cls = (s || "Draft").toLowerCase();
    return `<span class="pill ${cls}">${s}</span>`;
  },

  download(filename, content, mime = "text/plain") {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  readFile(file, asDataURL = true) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = e => resolve(e.target.result);
      r.onerror = e => reject(e);
      asDataURL ? r.readAsDataURL(file) : r.readAsText(file);
    });
  },

  debounce(fn, ms = 200) {
    let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  },

  setQuery(obj) {
    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    for (const k in obj) {
      if (obj[k] === null || obj[k] === undefined || obj[k] === "") params.delete(k);
      else params.set(k, obj[k]);
    }
    const base = location.hash.split("?")[0];
    const q = params.toString();
    location.hash = q ? `${base}?${q}` : base;
  },

  getQuery() {
    return Object.fromEntries(new URLSearchParams(location.hash.split("?")[1] || ""));
  }
};
