document.addEventListener("DOMContentLoaded", function () {
  initNavbar();
  initTicker();
  initCounters();
  initReveal();
  initFooterYear();
});

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


function initTicker() {
  const track = document.getElementById("tickerTrack");
  if (!track || typeof TICKER_ITEMS === "undefined") return;

  const renderSet = () =>
    TICKER_ITEMS.map((item) => {
      const dir = item.change > 0 ? "up" : item.change < 0 ? "down" : "flat";
      const arrow = dir === "up" ? "\u2191" : dir === "down" ? "\u2193" : "\u2194";
      const sign = item.change > 0 ? "+" : "";
      return `
        <span class="ticker-item">
          <span class="t-crop">${item.crop}</span>
          <span class="t-mandi">${item.mandi}</span>
          <span class="t-price">\u20B9${item.price.toLocaleString("en-IN")}</span>
          <span class="t-${dir}">${arrow} ${sign}${item.change.toFixed(1)}%</span>
        </span>`;
    }).join("");

  track.innerHTML = renderSet() + renderSet();
}

function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;

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
