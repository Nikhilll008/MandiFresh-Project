/* ==========================================================================
   MandiFresh — prices.js (API-integrated)
   Server now owns filtering, pagination, aggregation and trend data —
   this file just wires the DOM to GET /api/prices and
   GET /api/prices/chart/{id}.
   ========================================================================== */

(function () {
  const state = {
    crop: "",
    mandi: "",
    date: "",
    search: "",
    page: 1,
    pageSize: 8
  };

  let cropsById = {};   // name -> id, used to call /api/prices/chart/{id}
  let debounceTimer = null;

  document.addEventListener("DOMContentLoaded", async () => {
    if (!document.getElementById("priceTableBody")) return; // not on this page

    try {
      const crops = await loadCrops();
      crops.forEach((c) => (cropsById[c.name] = c.id));
      await loadMandis();
      populateFilterOptions(crops);
      bindFilterEvents();
      await renderAll();

      const firstCrop = crops[0];
      if (firstCrop) await renderChart(firstCrop.name);
    } catch (err) {
      console.error("Failed to initialise price dashboard:", err);
      document.getElementById("priceTableBody").innerHTML =
        `<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--loss);">
          Could not reach the MandiFresh API. Please try again shortly.</td></tr>`;
    }
  });

  function populateFilterOptions(crops) {
    const cropSel = document.getElementById("filterCrop");
    const mandiSel = document.getElementById("filterMandi");
    crops.forEach((c) => cropSel.insertAdjacentHTML("beforeend", `<option value="${c.name}">${c.name}</option>`));
    MANDI_LIST.forEach((m) => mandiSel.insertAdjacentHTML("beforeend", `<option value="${m}">${m}</option>`));

    const chartCropSel = document.getElementById("chartCropSelect");
    if (chartCropSel) {
      crops.forEach((c) => chartCropSel.insertAdjacentHTML("beforeend", `<option value="${c.name}">${c.name}</option>`));
      chartCropSel.addEventListener("change", (e) => renderChart(e.target.value));
    }
  }

  function bindFilterEvents() {
    document.getElementById("filterForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      state.crop = document.getElementById("filterCrop").value;
      state.mandi = document.getElementById("filterMandi").value;
      state.date = document.getElementById("filterDate").value;
      state.page = 1;
      await renderAll();
    });

    document.getElementById("resetFilters").addEventListener("click", async () => {
      document.getElementById("filterForm").reset();
      state.crop = ""; state.mandi = ""; state.date = ""; state.page = 1;
      document.getElementById("searchInput").value = "";
      state.search = "";
      await renderAll();
    });

    document.getElementById("searchInput").addEventListener("input", (e) => {
      state.search = e.target.value.trim();
      state.page = 1;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(renderAll, 350); // avoid a request per keystroke
    });
  }

  function buildQuery() {
    const params = new URLSearchParams();
    if (state.crop) params.set("crop", state.crop);
    if (state.mandi) params.set("mandi", state.mandi);
    if (state.date) params.set("date", state.date);
    if (state.search) params.set("search", state.search);
    params.set("page", state.page);
    params.set("per_page", state.pageSize);
    return params.toString();
  }

  async function renderAll() {
    const body = document.getElementById("priceTableBody");
    body.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--ink-soft);">Loading…</td></tr>`;

    try {
      const res = await apiFetch(`/prices?${buildQuery()}`);
      renderSummary(res.summary);
      renderTable(res.data);
      renderPagination(res.pagination);
    } catch (err) {
      console.error("Price fetch failed:", err);
      body.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--loss);">
        Could not load price records. ${err.message || ""}</td></tr>`;
    }
  }

  function renderSummary(summary) {
    const wrap = document.getElementById("summaryCards");
    if (!summary || !summary.total) {
      wrap.innerHTML = `
        <div class="summary-card"><span class="label">Highest Price</span><b>&mdash;</b></div>
        <div class="summary-card"><span class="label">Lowest Price</span><b>&mdash;</b></div>
        <div class="summary-card"><span class="label">Average Price</span><b>&mdash;</b></div>
        <div class="summary-card"><span class="label">Total Records</span><b>0</b></div>`;
      return;
    }
    wrap.innerHTML = `
      <div class="summary-card up"><span class="label">Highest Price</span><b>\u20B9${Number(summary.highest).toLocaleString("en-IN")}</b></div>
      <div class="summary-card down"><span class="label">Lowest Price</span><b>\u20B9${Number(summary.lowest).toLocaleString("en-IN")}</b></div>
      <div class="summary-card flat"><span class="label">Average Price</span><b>\u20B9${Number(summary.average).toLocaleString("en-IN")}</b></div>
      <div class="summary-card"><span class="label">Total Records</span><b>${summary.total}</b></div>`;
  }

  function trendOf(current, previous) {
    if (current > previous) return { dir: "up", label: "Increasing", arrow: "\u2191" };
    if (current < previous) return { dir: "down", label: "Decreasing", arrow: "\u2193" };
    return { dir: "flat", label: "Stable", arrow: "\u2194" };
  }

  function renderTable(rows) {
    const body = document.getElementById("priceTableBody");
    if (!rows || !rows.length) {
      body.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--ink-soft);">
        No mandi price records match your filters. Try clearing a filter or search term.</td></tr>`;
      return;
    }
    body.innerHTML = rows
      .map((r) => {
        const t = trendOf(r.current, r.previous);
        const dateFmt = new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        return `
        <tr>
          <td><span class="crop-cell"><span class="crop-dot"></span>${r.crop}</span></td>
          <td>${r.mandi}</td>
          <td>${dateFmt}</td>
          <td class="num">\u20B9${Number(r.current).toLocaleString("en-IN")}</td>
          <td class="num">\u20B9${Number(r.previous).toLocaleString("en-IN")}</td>
          <td><span class="trend-pill ${t.dir}">${t.arrow} ${t.label}</span></td>
        </tr>`;
      })
      .join("");
  }

  function renderPagination(pagination) {
    const { page, total, total_pages: totalPages } = pagination;
    state.page = page;

    const wrap = document.getElementById("paginationWrap");
    const info = document.getElementById("resultsInfo");
    const start = total === 0 ? 0 : (page - 1) * state.pageSize + 1;
    const end = Math.min(page * state.pageSize, total);
    info.textContent = `Showing ${start}\u2013${end} of ${total} records`;

    let html = `<button ${page === 1 ? "disabled" : ""} data-page="prev" aria-label="Previous page">\u2039</button>`;
    for (let p = 1; p <= totalPages; p++) {
      if (totalPages > 6 && p !== 1 && p !== totalPages && Math.abs(p - page) > 1) {
        if (p === 2 || p === totalPages - 1) html += `<span style="padding:0 4px; color:var(--ink-soft);">\u2026</span>`;
        continue;
      }
      html += `<button data-page="${p}" class="${p === page ? "active" : ""}">${p}</button>`;
    }
    html += `<button ${page === totalPages || totalPages === 0 ? "disabled" : ""} data-page="next" aria-label="Next page">\u203A</button>`;
    wrap.innerHTML = html;

    wrap.querySelectorAll("button[data-page]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const val = btn.dataset.page;
        if (val === "prev") state.page = Math.max(1, page - 1);
        else if (val === "next") state.page = Math.min(totalPages, page + 1);
        else state.page = parseInt(val, 10);
        await renderAll();
        document.getElementById("priceTableTop")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* --- Canvas line chart: fetches GET /api/prices/chart/{id} --- */
  async function renderChart(cropName) {
    const canvas = document.getElementById("priceChart");
    if (!canvas) return;
    const cropId = cropsById[cropName];
    if (!cropId) return;

    const chartCropSel = document.getElementById("chartCropSelect");
    if (chartCropSel) chartCropSel.value = cropName;

    let series;
    try {
      const res = await apiFetch(`/prices/chart/${cropId}?days=30`);
      series = res.data.prices;
    } catch (err) {
      console.error("Chart fetch failed:", err);
      return;
    }
    if (!series || !series.length) return;

    drawTrendChart(canvas, series);

    const titleEl = document.getElementById("chartTitleCrop");
    if (titleEl) titleEl.textContent = cropName;

    canvas.dataset.lastCrop = cropName; // used on resize
  }

  function drawTrendChart(canvas, data) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 320 * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = 320;
    const padding = { top: 20, right: 20, bottom: 34, left: 56 };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = "#E2E7D9";
    ctx.fillStyle = "#5B5D52";
    ctx.font = "11px 'IBM Plex Mono', monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (plotH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.lineWidth = 1;
      ctx.stroke();
      const value = Math.round(max - (range / gridLines) * i);
      ctx.fillText("\u20B9" + value.toLocaleString("en-IN"), padding.left - 10, y);
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    data.forEach((_, i) => {
      if (i % 5 !== 0 && i !== data.length - 1) return;
      const x = padding.left + (plotW / (data.length - 1)) * i;
      const daysAgo = data.length - 1 - i;
      const label = daysAgo === 0 ? "Today" : `-${daysAgo}d`;
      ctx.fillText(label, x, h - padding.bottom + 10);
    });

    const points = data.map((val, i) => ({
      x: padding.left + (plotW / (data.length - 1)) * i,
      y: padding.top + plotH - ((val - min) / range) * plotH
    }));

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + plotH);
    gradient.addColorStop(0, "rgba(46,125,50,0.22)");
    gradient.addColorStop(1, "rgba(46,125,50,0.02)");
    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + plotH);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padding.top + plotH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    const last = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#F9A825";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  window.addEventListener("resize", () => {
    const canvas = document.getElementById("priceChart");
    if (canvas?.dataset.lastCrop) renderChart(canvas.dataset.lastCrop);
  });
})();
