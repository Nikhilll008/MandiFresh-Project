/* ==========================================================================
   MandiFresh — data.js (API-backed replacement)
   Previously this file held hardcoded CROP_LIST / MANDI_LIST / PRICE_RECORDS
   arrays. It now fetches the same shapes from the CodeIgniter 4 API, so
   main.js / prices.js / calculator.js keep working with the same variable
   names wherever practical, but as async loader functions instead of
   plain arrays (arrays can't hold data that hasn't arrived yet).
   ========================================================================== */

let CROP_LIST = [];   // array of crop name strings, populated by loadCrops()
let MANDI_LIST = [];  // array of mandi name strings, populated by loadMandis()

/**
 * GET /api/crops -> populates CROP_LIST and returns the full crop
 * objects ({id, name, category, unit}) for callers that need the id.
 */
async function loadCrops() {
  const res = await apiFetch("/crops");
  const crops = res.data || [];
  CROP_LIST = crops.map((c) => c.name);
  return crops;
}

/**
 * GET /api/mandis -> populates MANDI_LIST.
 */
async function loadMandis() {
  const res = await apiFetch("/mandis");
  MANDI_LIST = res.data || [];
  return MANDI_LIST;
}

/**
 * GET /api/dashboard -> homepage stats band + top movers.
 */
async function loadDashboardStats() {
  const res = await apiFetch("/dashboard");
  return res.data;
}

/**
 * Builds the scrolling ticker strip from the most recently updated
 * price rows (GET /api/prices, newest first, no filters).
 */
async function loadTickerItems(limit = 10) {
  const res = await apiFetch(`/prices?per_page=${limit}&page=1`);
  return (res.data || []).map((row) => ({
    crop: row.crop,
    mandi: row.mandi.split(",")[0], // short mandi name for the ticker
    price: row.current,
    change: row.previous > 0 ? Math.round(((row.current - row.previous) / row.previous) * 1000) / 10 : 0
  }));
}
