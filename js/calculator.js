document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("calcForm");
  if (!form) return;

  const resultsWrap = document.getElementById("calcResults");
  const insightsWrap = document.getElementById("calcInsights");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    calculate();
  });

  form.addEventListener("input", () => {
    if (resultsWrap.dataset.touched === "true") calculate();
  });

  function calculate() {
    resultsWrap.dataset.touched = "true";

    const cropName = document.getElementById("calcCrop").value.trim() || "Your Crop";
    const quantity = parseFloat(document.getElementById("calcQuantity").value) || 0;
    const productionCost = parseFloat(document.getElementById("calcCost").value) || 0;
    const sellingPrice = parseFloat(document.getElementById("calcPrice").value) || 0;

    const revenue = quantity * sellingPrice;
    const totalCost = quantity * productionCost;
    const net = revenue - totalCost;
    const isProfit = net >= 0;

    const fmt = (n) => "\u20B9" + Math.round(n).toLocaleString("en-IN");

    resultsWrap.innerHTML = `
      <div class="result-card">
        <span>Revenue</span>
        <b>${fmt(revenue)}</b>
      </div>
      <div class="result-card">
        <span>Total Cost</span>
        <b>${fmt(totalCost)}</b>
      </div>
      <div class="result-card ${isProfit ? "profit" : "loss"}">
        <span>${isProfit ? "Net Profit" : "Net Loss"}</span>
        <b>${fmt(Math.abs(net))}</b>
      </div>`;

    const marginPct = revenue > 0 ? (net / revenue) * 100 : 0;
    const breakeven = quantity > 0 ? totalCost / quantity : 0;
    const suggested = breakeven * 1.2; // suggest a 20% margin target

    insightsWrap.innerHTML = `
      <div class="insight-row">
        <span>Crop</span><b>${escapeHtml(cropName)}</b>
      </div>
      <div class="insight-row">
        <span>Profit Margin</span>
        <b style="color:${marginPct >= 0 ? "var(--profit)" : "var(--loss)"}">${marginPct.toFixed(1)}%</b>
      </div>
      <div class="insight-row">
        <span>Break-even Price</span><b>${fmt(breakeven)} / kg</b>
      </div>
      <div class="insight-row">
        <span>Suggested Selling Rate</span><b>${fmt(suggested)} / kg</b>
      </div>`;

    insightsWrap.closest(".insights-panel")?.classList.remove("d-none");
    document.getElementById("calcResultZone")?.classList.remove("d-none");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
});
