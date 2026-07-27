# MandiFresh API Reference

Base URL (production): `https://api.mandifresh.in/api`
Base URL (local dev):   `http://localhost:8080/api`

All responses are JSON with a consistent envelope:

```json
{ "status": "success", "data": { } }
{ "status": "error", "message": "...", "errors": { } }
```

---

## GET /api/dashboard

Homepage stats band + top movers.

**Response 200**
```json
{
  "status": "success",
  "data": {
    "total_crops": 15,
    "total_mandis": 10,
    "total_records": 1350,
    "records_last_30_days": 1350,
    "highest_price": 15230.50,
    "lowest_price": 312.10,
    "average_price": 4482.75,
    "total_calculations": 42,
    "top_gainers": [
      { "crop": "Turmeric", "mandi": "Nizamabad Mandi, Telangana", "current": 14890, "previous": 14150, "change_pct": 5.23 }
    ],
    "top_losers": [
      { "crop": "Tomato", "mandi": "Pune Market Yard", "current": 2100, "previous": 2260, "change_pct": -7.08 }
    ],
    "generated_at": "2026-07-02 10:15:00"
  }
}
```

---

## GET /api/prices

Filtered, paginated mandi price listing (powers the dashboard table).

**Query params** (all optional): `crop`, `mandi`, `date` (YYYY-MM-DD), `search`, `page` (default 1), `per_page` (default 10, max 100)

`GET /api/prices?crop=Onion&page=1&per_page=8`

**Response 200**
```json
{
  "status": "success",
  "filters": { "crop": "Onion", "mandi": "", "date": "", "search": "" },
  "summary": { "highest": 1980.00, "lowest": 1690.00, "average": 1832.40, "total": 120 },
  "pagination": { "page": 1, "per_page": 8, "total": 120, "total_pages": 15 },
  "data": [
    {
      "id": 431, "crop_id": 1, "crop": "Onion", "unit": "quintal",
      "mandi": "Lasalgaon Mandi, Nashik", "date": "2026-06-30",
      "current": 1798.00, "previous": 1726.50
    }
  ]
}
```

---

## GET /api/prices/crop/{id}

Latest price for one crop across every mandi that tracks it.

`GET /api/prices/crop/1` → 404 with `{"status":"error","message":"Crop not found."}` if the id doesn't exist.

---

## GET /api/prices/chart/{id}

30-day (or `?days=N`, max 90) daily-average trend, pre-formatted for the HTML5 Canvas chart.

`GET /api/prices/chart/4?days=30`

**Response 200**
```json
{
  "status": "success",
  "crop": "Wheat",
  "days": 30,
  "data": {
    "labels": ["2026-06-01", "2026-06-02", "..."],
    "prices": [2298.5, 2310.2, "..."]
  }
}
```

---

## GET /api/prices/history/{id}

Raw, non-aggregated price rows for a crop (per mandi, per day) — `?days=N` optional.

---

## GET /api/crops

Active crop list, for the Crop filter dropdown.

```json
{ "status": "success", "data": [ { "id": 1, "name": "Onion", "category": "vegetable", "unit": "quintal", "is_active": 1 } ] }
```

## GET /api/mandis

Distinct mandi names, for the Mandi filter dropdown.

```json
{ "status": "success", "data": ["Azadpur Mandi, Delhi", "Coimbatore Mandi, TN", "..."] }
```

---

## POST /api/profit/calculate

Server-side profit calculation (also logged to `profit_calculations`).

**Request body** (JSON or form-encoded)
```json
{
  "crop_name": "Onion",
  "quantity_kg": 1000,
  "production_cost_per_kg": 12,
  "selling_price_per_kg": 18
}
```

**Response 201**
```json
{
  "status": "success",
  "data": {
    "crop_name": "Onion",
    "quantity_kg": 1000,
    "production_cost_per_kg": 12,
    "selling_price_per_kg": 18,
    "revenue": 18000,
    "total_cost": 12000,
    "net_profit": 6000,
    "is_profit": true,
    "profit_margin": 33.33,
    "break_even_price": 12,
    "suggested_price": 14.4
  }
}
```

**Response 422 (validation failure)**
```json
{
  "status": "error",
  "message": "Validation failed.",
  "errors": {
    "quantity_kg": "Quantity must be greater than 0."
  }
}
```

## GET /api/profit/history

Most recent saved calculations (`?limit=N`, default 20, max 100) — useful for an admin view.

---

## Error conventions

| Code | Meaning |
|------|---------|
| 200  | Success (GET) |
| 201  | Created (successful POST) |
| 404  | Resource not found (bad crop id, unknown route) |
| 422  | Validation failed |
| 500  | Unhandled server error |
