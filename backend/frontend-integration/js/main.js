/* ==========================================================================
   MandiFresh — main.js (API-integrated)
   Load order on every page: config.js, data.js, then this file.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  initNavbar();
  initTicker();       // now async — fetches /api/prices
  initCounters();      // now pulls live totals from /api/dashboard first
  initReveal();
  initFooterYear();
});

/* --- Sticky navbar shadow + mobile toggle (unchanged, no API needed) --- */
function initNavbar() {
  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => links.classList.remove("is-open"))
    );
  }
}

/* --- Mandi ticker strip: now sourced from GET /api/prices --- */
async function initTicker() {
  const track = document.getElementById("tickerTrack");
  if (!track) return;

  track.innerHTML = `<span class="ticker-item"><span class="t-mandi">Loading live mandi prices…</span></span>`;

  try {
    const items = await loadTickerItems(10);
    if (!items.length) {
      track.innerHTML = `<span class="ticker-item"><span class="t-mandi">No price data available yet.</span></span>`;
      return;
    }
    const renderSet = () =>
      items
        .map((item) => {
          const dir = item.change > 0 ? "up" : item.change < 0 ? "down" : "flat";
          const arrow = dir === "up" ? "\u2191" : dir === "down" ? "\u2193" : "\u2194";
          const sign = item.change > 0 ? "+" : "";
          return `
            <span class="ticker-item">
              <span class="t-crop">${item.crop}</span>
              <span class="t-mandi">${item.mandi}</span>
              <span class="t-price">\u20B9${Number(item.price).toLocaleString("en-IN")}</span>
              <span class="t-${dir}">${arrow} ${sign}${item.change.toFixed(1)}%</span>
            </span>`;
        })
        .join("");
    track.innerHTML = renderSet() + renderSet();
  } catch (err) {
    console.error("Ticker load failed:", err);
    track.innerHTML = `<span class="ticker-item"><span class="t-mandi">Live prices are temporarily unavailable.</span></span>`;
  }
}

/* --- Animated counters (stats band): live totals + animate on scroll --- */
async function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;

  // Try to replace the HTML's placeholder counts with real numbers from
  // the API before the scroll-triggered animation runs. If the request
  // fails, the counters simply animate up to the static fallback values
  // already present in the HTML (data-counter attributes).
  try {
    const stats = await loadDashboardStats();
    const map = {
      farmers: null, // no farmers table yet — keep the frontend's static "500+"
      crops: stats.total_crops,
      records: stats.total_records
    };
    counters.forEach((el) => {
      const key = el.dataset.metric; // set data-metric="crops" etc. in HTML if desired
      if (key && map[key] != null) el.dataset.counter = map[key];
    });
  } catch (err) {
    console.error("Dashboard stats load failed, using static fallback counters:", err);
  }

  const animate = (el) => {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString("en-IN") + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((c) => io.observe(c));
}

/* --- Scroll reveal for elements marked .reveal (unchanged) --- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => io.observe(el));
}

function initFooterYear() {
  const el = document.getElementById("footerYear");
  if (el) el.textContent = new Date().getFullYear();
}
