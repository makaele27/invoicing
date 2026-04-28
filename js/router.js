// ============== Router ==============
const Router = (() => {
  const routes = [
    { match: /^#\/dashboard$/, fn: () => DashboardView.render() },
    { match: /^#\/invoices$/, fn: () => InvoicesView.render() },
    { match: /^#\/invoices\/new$/, fn: () => {
        const q = Utils.getQuery();
        EditorView.render("new");
        if (q.client) { EditorView.current.clientId = q.client; EditorView.renderClient(); }
      } },
    { match: /^#\/invoices\/([^\/?]+)\/preview$/, fn: (id) => PreviewView.render(id) },
    { match: /^#\/invoices\/([^\/?]+)$/, fn: (id) => EditorView.render(id) },
    { match: /^#\/clients$/, fn: () => ClientsView.render() },
    { match: /^#\/products$/, fn: () => ProductsView.render() },
    { match: /^#\/settings$/, fn: () => SettingsView.render() },
    { match: /^#\/backup$/, fn: () => BackupView.render() },
  ];

  function go() {
    const hash = (location.hash || "#/dashboard").split("?")[0];
    for (const r of routes) {
      const m = hash.match(r.match);
      if (m) {
        try { r.fn(...m.slice(1)); }
        catch (e) { console.error(e); UI.toast("Error: " + e.message, "error"); }
        Router.updateNav(hash);
        window.scrollTo({ top: 0, behavior: "instant" });
        return;
      }
    }
    location.hash = "#/dashboard";
  }

  function updateNav(hash) {
    $$(".sidebar a[data-route]").forEach(a => {
      const route = a.dataset.route;
      const active = hash === route || (route === "#/invoices" && hash.startsWith("#/invoices"));
      a.classList.toggle("active", active);
    });
  }

  return { go, updateNav };
})();
