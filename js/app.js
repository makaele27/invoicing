// ============== App boot ==============
const App = {
  init() {
    // Sidebar nav links
    $$(".sidebar a[data-route]").forEach(a => {
      a.addEventListener("click", e => {
        e.preventDefault();
        location.hash = a.dataset.route;
      });
    });

    // ESC closes modal
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") UI.closeModal();
    });

    window.addEventListener("hashchange", Router.go);

    App.refreshBadges();
    Router.go();
  },

  refreshBadges() {
    const open = Store.invoices().filter(inv => {
      const st = Utils.computeStatus(inv);
      return st !== "Paid" && st !== "Cancelled";
    }).length;
    const badge = $("badgeInvoices");
    if (badge) badge.textContent = open ? open : "";
    const userBadge = $("userBadge");
    if (userBadge) {
      const s = Store.settings();
      userBadge.textContent = s.companyName || "";
    }
  }
};

document.addEventListener("DOMContentLoaded", App.init);
