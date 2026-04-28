// ============== UI helpers ==============
const UI = (() => {
  let toastTimer;

  function toast(msg, type = "default") {
    const el = $("toast");
    el.textContent = msg;
    el.className = "toast " + (type === "error" ? "error" : type === "success" ? "success" : "");
    clearTimeout(toastTimer);
    requestAnimationFrame(() => el.classList.remove("hidden"));
    toastTimer = setTimeout(() => el.classList.add("hidden"), 2400);
  }

  function openModal({ title, body, footer, large = false }) {
    $("modalTitle").textContent = title || "";
    if (typeof body === "string") $("modalBody").innerHTML = body;
    else { $("modalBody").innerHTML = ""; $("modalBody").appendChild(body); }
    $("modalFoot").innerHTML = "";
    (footer || []).forEach(b => $("modalFoot").appendChild(b));
    const card = document.querySelector(".modal-card");
    card.classList.toggle("large", !!large);
    $("modal").classList.remove("hidden");
  }

  function closeModal() {
    $("modal").classList.add("hidden");
  }

  function btn(label, onClick, cls = "btn btn-ghost") {
    const b = document.createElement("button");
    b.className = cls;
    b.innerHTML = label;
    b.onclick = onClick;
    return b;
  }

  function confirm(msg, onYes, { yesLabel = "Confirm", danger = false } = {}) {
    const ok = btn(yesLabel, () => { closeModal(); onYes(); }, danger ? "btn btn-danger" : "btn btn-primary");
    const cancel = btn("Cancel", closeModal, "btn btn-ghost");
    openModal({ title: "Please confirm", body: `<p class="text-sm text-gray-700">${Utils.escapeHtml(msg)}</p>`, footer: [cancel, ok] });
  }

  function setTopActions(actions = []) {
    const el = $("topActions");
    el.innerHTML = "";
    actions.forEach(a => el.appendChild(a));
  }

  function setTitle(title, crumb) {
    $("pageTitle").textContent = title || "";
    $("crumb").textContent = crumb || "";
    document.title = (title ? title + " · " : "") + "Mallo Invoicing";
  }

  return { toast, openModal, closeModal, confirm, btn, setTopActions, setTitle };
})();
