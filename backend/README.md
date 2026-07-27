# MandiFresh — CodeIgniter 4 Backend

REST API backend for the MandiFresh static frontend (index.html,
prices.html, calculator.html, about.html). Built with CodeIgniter 4,
PHP 8+, and MySQL, following MVC with Query Builder — no raw SQL string
concatenation anywhere, so all queries are parameterised against SQL
injection by default.

## What's in this package

```
app/
  Config/
    Routes.php          -> all web + API routes
    Filters.php          -> CORS registration, CSRF exemption for /api/*
  Controllers/Api/
    BaseApiController.php -> shared JSON response helpers
    HomeController.php    -> GET /api/dashboard
    PriceController.php   -> GET /api/prices, /api/prices/crop/{id},
                              /api/prices/chart/{id}, /api/prices/history/{id},
                              /api/crops, /api/mandis
    ProfitController.php  -> POST /api/profit/calculate, GET /api/profit/history
  Models/
    CropModel.php
    PriceModel.php         -> filtering, MAX/MIN/AVG/COUNT aggregation, 30-day trend
    CalculationModel.php
  Filters/
    CorsFilter.php
  Database/
    Migrations/            -> 3 tables: crops, mandi_prices, profit_calculations
    Seeds/
      CropSeeder.php        -> 15 crops matching the existing frontend
      MandiPriceSeeder.php  -> 30 days x crops x mandis realistic sample data
      DatabaseSeeder.php    -> runs both in order

database/
  mandifresh.sql            -> full CREATE TABLE + sample data, for a
                               direct phpMyAdmin import on shared hosting

frontend-integration/
  js/config.js, data.js, main.js, prices.js, calculator.js
                             -> drop-in replacements that connect the
                               existing frontend to this API (see its
                               own README.md)

.env.example                -> copy to .env and fill in real DB credentials
API_DOCUMENTATION.md         -> full endpoint reference with sample JSON
DEPLOYMENT.md                -> step-by-step Hostinger shared hosting guide
```

## How this maps onto a full CI4 project

This package contains only the **application-layer files specific to
MandiFresh** — it assumes you start from a standard CodeIgniter 4
skeleton (`composer create-project codeigniter4/appstarter mandifresh-backend`)
and then copy these files into the matching folders, overwriting the
default `app/Config/Routes.php` and `app/Config/Filters.php`. The rest
of the CI4 skeleton (`system/` if not using Composer, `vendor/`,
`public/index.php`, etc.) is untouched.

## Quick start (local development)

```bash
composer create-project codeigniter4/appstarter mandifresh-backend
cd mandifresh-backend
# copy this package's app/, database/, .env.example over the new project
cp .env.example .env
# edit .env: set database.default.* to your local MySQL credentials

php spark migrate --all
php spark db:seed DatabaseSeeder

php spark serve
# API now live at http://localhost:8080/api/dashboard
```

## Database tables

| Table | Purpose |
|---|---|
| `crops` | Master list of tracked crops (name, category, unit) |
| `mandi_prices` | Daily price per crop per mandi — `current_price` / `previous_price` drive the Increasing/Decreasing/Stable trend shown in the frontend table |
| `profit_calculations` | Every profit calculator submission, logged server-side for analytics/history |

## Security measures implemented

- **CSRF**: CodeIgniter's CSRF filter runs on all routes except `api/*` (stateless JSON API consumed via `fetch()` doesn't use CI4's session-token CSRF flow — see `Filters.php` comments for the reasoning).
- **Input sanitisation**: query/body params are trimmed and `strip_tags()`-ed before use; all DB access goes through Query Builder / Model methods (parameterised, not string-concatenated).
- **Validation**: CodeIgniter's Validation library enforces required fields, numeric/decimal types, and value ranges (e.g. `quantity_kg` must be `greater_than[0]`) before anything touches the database.
- **XSS**: dynamic values are never echoed into HTML by this backend (it only returns JSON), removing the main XSS vector; the frontend integration files also escape text via `textContent` before inserting into the DOM.
- **CORS**: explicit allow-list-ready filter (`CorsFilter.php`) rather than leaving the browser to enforce same-origin by accident.

## Next steps you may want to add later

- An `farmers` table + auth, if you want the "500+ Farmers" stat to become real data instead of a static frontend number.
- Rate limiting on `POST /api/profit/calculate` (CodeIgniter's `Throttle` filter) if this becomes public-facing at scale.
- A cron/Task Scheduler job (`php spark` command) to ingest real government mandi price feeds (e.g. Agmarknet) into `mandi_prices` daily.
