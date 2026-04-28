// ============== Settings ==============
const SettingsView = {
  render() {
    UI.setTitle("Settings", "Workspace");
    UI.setTopActions([UI.btn("💾 Save Changes", () => SettingsView.save(), "btn btn-primary")]);

    const s = Store.settings();
    const view = $("view");
    view.innerHTML = `
      <div class="p-6 max-w-5xl mx-auto space-y-6">

        <div class="card card-elev">
          <h3 class="section-title">Company Info (appears on invoices)</h3>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="label">Logo</label>
              <label for="logoUpload" class="upload-box" id="logoBox">
                ${s.logo ? `<img src="${s.logo}">` : `<span>⬆<br>Upload Logo<br><span class="text-[10px]">JPEG/PNG · Recommended 300×200</span></span>`}
              </label>
              <input type="file" id="logoUpload" accept="image/*" class="hidden">
              ${s.logo ? `<button class="text-xs text-red-600 mt-1" onclick="SettingsView.clearLogo()">Remove logo</button>` : ""}

              <label class="label mt-4">Signature</label>
              <label for="sigUpload" class="upload-box" id="sigBox">
                ${s.signature ? `<img src="${s.signature}">` : `<span>⬆<br>Upload Signature<br><span class="text-[10px]">PNG with transparent BG</span></span>`}
              </label>
              <input type="file" id="sigUpload" accept="image/*" class="hidden">
              ${s.signature ? `<button class="text-xs text-red-600 mt-1" onclick="SettingsView.clearSig()">Remove signature</button>` : ""}
            </div>
            <div class="grid grid-cols-1 gap-3">
              <div><label class="label">Company Name *</label><input id="sName" class="field" value="${Utils.escapeHtml(s.companyName || "")}"></div>
              <div><label class="label">Address</label><textarea id="sAddr" class="field" rows="3">${Utils.escapeHtml(s.companyAddress || "")}</textarea></div>
              <div class="grid grid-cols-2 gap-3">
                <div><label class="label">Phone</label><input id="sPhone" class="field" value="${Utils.escapeHtml(s.companyPhone || "")}"></div>
                <div><label class="label">Email</label><input id="sEmail" class="field" value="${Utils.escapeHtml(s.companyEmail || "")}"></div>
              </div>
              <div><label class="label">Tax ID / NPWP</label><input id="sTaxId" class="field" value="${Utils.escapeHtml(s.companyTaxId || "")}"></div>
            </div>
          </div>
        </div>

        <div class="card card-elev">
          <h3 class="section-title">Invoice Defaults</h3>
          <div class="grid md:grid-cols-3 gap-4">
            <div>
              <label class="label">Currency Symbol</label>
              <input id="sCurrency" class="field" value="${Utils.escapeHtml(s.currency || "Rp")}">
              <div class="text-xs text-gray-500 mt-1">e.g. Rp, $, €, IDR</div>
            </div>
            <div>
              <label class="label">Default Tax %</label>
              <input id="sTax" type="number" min="0" step="any" class="field" value="${s.defaultTax || 0}">
            </div>
            <div>
              <label class="label">Default Payment Days</label>
              <input id="sDays" type="number" min="0" class="field" value="${s.defaultPaymentDays || 14}">
            </div>
          </div>
          <div class="grid md:grid-cols-3 gap-4 mt-4">
            <div>
              <label class="label">Invoice Number Prefix</label>
              <input id="sPrefix" class="field" value="${Utils.escapeHtml(s.invoicePrefix || "")}">
              <div class="text-xs text-gray-500 mt-1">e.g. <span class="kbd">INV/2026/</span></div>
            </div>
            <div>
              <label class="label">Next Invoice Number</label>
              <input id="sNext" type="number" min="1" class="field" value="${s.invoiceNextNumber || 1}">
            </div>
            <div>
              <label class="label">Number Padding</label>
              <input id="sPad" type="number" min="1" max="8" class="field" value="${s.invoicePadding || 4}">
              <div class="text-xs text-gray-500 mt-1">Preview: <span class="kbd" id="numPreview"></span></div>
            </div>
          </div>
        </div>

        <div class="card card-elev">
          <h3 class="section-title">Default Notes &amp; Terms</h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="label">Default Notes (auto-fills new invoices)</label>
              <textarea id="sNotes" class="field" rows="5">${Utils.escapeHtml(s.defaultNotes || "")}</textarea>
            </div>
            <div>
              <label class="label">Default Terms &amp; Conditions</label>
              <textarea id="sTerms" class="field" rows="5">${Utils.escapeHtml(s.defaultTerms || "")}</textarea>
            </div>
          </div>
        </div>

      </div>
    `;

    // Logo + signature uploads
    $("logoUpload").addEventListener("change", async e => {
      const f = e.target.files[0]; if (!f) return;
      if (f.size > 2 * 1024 * 1024) { UI.toast("Max 2 MB", "error"); return; }
      const dataURL = await Utils.readFile(f);
      Store.updateSettings({ logo: dataURL });
      UI.toast("Logo updated", "success");
      SettingsView.render();
    });
    $("sigUpload").addEventListener("change", async e => {
      const f = e.target.files[0]; if (!f) return;
      if (f.size > 2 * 1024 * 1024) { UI.toast("Max 2 MB", "error"); return; }
      const dataURL = await Utils.readFile(f);
      Store.updateSettings({ signature: dataURL });
      UI.toast("Signature updated", "success");
      SettingsView.render();
    });

    const updatePreview = () => {
      const prefix = $("sPrefix").value;
      const num = String(+$("sNext").value || 1).padStart(+$("sPad").value || 4, "0");
      $("numPreview").textContent = prefix + num;
    };
    ["sPrefix", "sNext", "sPad"].forEach(id => $(id).addEventListener("input", updatePreview));
    updatePreview();
  },

  clearLogo() { Store.updateSettings({ logo: null }); SettingsView.render(); },
  clearSig() { Store.updateSettings({ signature: null }); SettingsView.render(); },

  save() {
    Store.updateSettings({
      companyName: $("sName").value.trim(),
      companyAddress: $("sAddr").value.trim(),
      companyPhone: $("sPhone").value.trim(),
      companyEmail: $("sEmail").value.trim(),
      companyTaxId: $("sTaxId").value.trim(),
      currency: $("sCurrency").value.trim() || "Rp",
      defaultTax: +$("sTax").value || 0,
      defaultPaymentDays: +$("sDays").value || 14,
      invoicePrefix: $("sPrefix").value,
      invoiceNextNumber: +$("sNext").value || 1,
      invoicePadding: +$("sPad").value || 4,
      defaultNotes: $("sNotes").value,
      defaultTerms: $("sTerms").value,
    });
    UI.toast("Settings saved", "success");
  }
};
