/* ==========================================================================
   MandiFresh — API configuration
   Include this BEFORE main.js / prices.js / calculator.js on every page.
   ========================================================================== */

// Point this at your deployed CodeIgniter 4 API.
// Local dev (CI4 built-in server):  http://localhost:8080/api
// Production (Hostinger):           https://api.mandifresh.in/api
const API_BASE_URL = "http://localhost:8080/api";

/**
 * Small fetch wrapper: parses JSON, throws on non-2xx / status:"error"
 * so callers can use a single try/catch.
 */
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...options
  });

  let body;
  try {
    body = await res.json();
  } catch (e) {
    throw new Error(`Invalid JSON response from ${path}`);
  }

  if (!res.ok || body.status === "error") {
    const message = body?.message || `Request to ${path} failed (${res.status})`;
    const err = new Error(message);
    err.errors = body?.errors || null;
    err.status = res.status;
    throw err;
  }

  return body;
}
