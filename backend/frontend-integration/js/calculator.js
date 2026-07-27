/* ==========================================================================
   MandiFresh — calculator.js (API-integrated)
   Posts to POST /api/profit/calculate instead of computing purely
   client-side, so the number shown matches server-side validation and
   is logged to profit_calculations for analytics.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("calcForm");
  if (!form) return;

  const resultsWrap = document.getElementById("calcResults");
  const insightsWrap = document.getElementById("calcInsights");
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await calculate();
  });

  async function calculate() {
    const cropName = document.getElementById("calcCrop").value.trim() || "Your Crop";
    const quantity = document.getElementById("calcQuantity").value;
    const productionCost = document.getElementById("calcCost").value;
    const sellingPrice = document.getElementById("calcPrice").value;

    setLoading(true);

    try {
      const res = await apiFetch("/profit/calculate", {
        method: "POST",
        body: JSON.stringify({
          crop_name: cropName,
          quantity_kg: quantity,
          production_cost_per_kg: productionCost,
          selling_price_per_kg: sellingPrice
        })
      });

      renderResults(res.data);
    } catch (err) {
      console.error("Profit calculation failed:", err);
      if (err.errors) {
        renderValidationErrors(err.errors);
      } else {
        resultsWrap.innerHTML = `<div class="result-card loss" style="grid-column:1/-1;">
          <span>Error</span><b style="font-size:0.95rem;">${err.message || "Could not reach the MandiFresh API."}</b>
        </div>`;
      }
    } finally {
      setLoading(false);
    }
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Calculating…" : "Calculate Profit";
  }

  function renderResults(data) {
    const fmt = (n) => "\u20B9" + Math.round(n).toLocaleString("en-IN");
    const isProfit = data.is_profit;

    resultsWrap.innerHTML = `
      <div class="result-card">
        <span>Revenue</span>
        <b>${fmt(data.revenue)}</b>
      </div>
      <div class="result-card">
        <span>Total Cost</span>
        <b>${fmt(data.total_cost)}</b>
      </div>
      <div class="result-card ${isProfit ? "profit" : "loss"}">
        <span>${isProfit ? "Net Profit" : "Net Loss"}</span>
        <b>${fmt(Math.abs(data.net_profit))}</b>
      </div>`;

    insightsWrap.innerHTML = `
      <div class="insight-row">
        <span>Crop</span><b>${escapeHtml(data.crop_name)}</b>
      </div>
      <div class="insight-row">
        <span>Profit Margin</span>
        <b style="color:${data.profit_margin >= 0 ? "var(--profit)" : "var(--loss)"}">${Number(data.profit_margin).toFixed(1)}%</b>
      </div>
      <div class="insight-row">
        <span>Break-even Price</span><b>${fmt(data.break_even_price)} / kg</b>
      </div>
      <div class="insight-row">
        <span>Suggested Selling Rate</span><b>${fmt(data.suggested_price)} / kg</b>
      </div>`;
  }

  function renderValidationErrors(errors) {
    const list = Object.values(errors).join(" ");
    resultsWrap.innerHTML = `<div class="result-card loss" style="grid-column:1/-1;">
      <span>Please check your inputs</span><b style="font-size:0.9rem; line-height:1.4;">${escapeHtml(list)}</b>
    </div>`;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
});
