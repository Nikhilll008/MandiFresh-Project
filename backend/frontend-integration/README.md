# Wiring the existing frontend to this API

These files are drop-in replacements for the same-named files in the
frontend's `js/` folder. They keep the same DOM element IDs and overall
structure — only the data source changes, from static in-file arrays to
`fetch()` calls against the CI4 API.

## 1. Add `config.js` and update script order

In `index.html`, `prices.html`, `calculator.html`, `about.html`, add
**one new `<script>` tag** before the existing ones, and set
`API_BASE_URL` in it to your deployed API:

```html
<script src="js/config.js"></script>
<script src="js/data.js"></script>
<script src="js/main.js"></script>
<script src="js/prices.js"></script>      <!-- prices.html only -->
<script src="js/calculator.js"></script>  <!-- calculator.html only -->
```

That's the only HTML change required — no markup, layout, or styling is
touched.

## 2. Replace the JS files

Copy `frontend-integration/js/config.js`, `data.js`, `main.js`,
`prices.js`, and `calculator.js` over the corresponding files in the
frontend's `js/` folder.

## 3. What changed, file by file

- **config.js** *(new)* — holds `API_BASE_URL` and a small `apiFetch()` helper used by every other file.
- **data.js** — no longer builds `PRICE_RECORDS` / `TREND_SERIES` locally. Now exposes `loadCrops()`, `loadMandis()`, `loadDashboardStats()`, `loadTickerItems()`, all backed by the API.
- **main.js** — `initTicker()` and `initCounters()` are now `async` and pull live numbers from `/api/prices` and `/api/dashboard`. Everything else (navbar, scroll reveal, footer year) is unchanged.
- **prices.js** — filtering, search, pagination and the summary cards are now driven by `GET /api/prices` query params instead of client-side array filtering. The canvas chart now calls `GET /api/prices/chart/{id}`.
- **calculator.js** — the form now `POST`s to `/api/profit/calculate` and renders whatever the server returns (which is also logged to `profit_calculations`), instead of computing everything in the browser.

## 4. CORS

If the frontend and API end up on different domains/subdomains, keep
`app/Filters/CorsFilter.php` enabled (it is, globally, by default). For
production, replace the wildcard origin in that filter with your real
frontend domain.
