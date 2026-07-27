# Deploying MandiFresh Backend to Hostinger Shared Hosting

## 1. Requirements check
- PHP 8.1+ (set in hPanel → Advanced → PHP Configuration)
- MySQL 5.7+/8 database (hPanel → Databases → MySQL Databases)
- Enable PHP extensions: `intl`, `mbstring`, `mysqli`, `json`, `curl` (all on by default on Hostinger)

## 2. Create the database
1. hPanel → **Databases → MySQL Databases** → create a database + user, note the generated names (Hostinger prefixes them, e.g. `u123456789_mandifresh`).
2. Assign the user to the database with **All Privileges**.

## 3. Upload the code
Two options:

**Option A — Git (Business/Cloud plans with SSH)**
```bash
ssh u123456789@yourserver.hostinger.com
cd domains/api.mandifresh.in
git clone <your-repo> .
composer install --no-dev --optimize-autoloader
```

**Option B — File Manager / FTP (all shared plans)**
1. Zip the whole CodeIgniter 4 project locally (after running `composer install` locally so `vendor/` is included, since shared hosting may not offer Composer).
2. Upload and extract via hPanel → **File Manager**, or FileZilla/FTP, into `domains/api.mandifresh.in/` (or a subfolder, e.g. `public_html/mandifresh-backend/`).

## 4. Point the domain at `/public`
CodeIgniter 4 should only ever expose the `public/` folder to the web — never the project root (it contains `app/`, `.env`, etc.).

- **Subdomain setup (recommended)**: create `api.mandifresh.in` in hPanel → Domains → Subdomains, and set its **document root** to the project's `public/` folder.
- **Subfolder setup**: if you can't change the document root, either:
  - move the contents of `public/` into `public_html/` and adjust the `FCPATH`/`app/Config/Paths.php` include paths, or
  - add a redirect `.htaccess` in `public_html/` pointing to `mandifresh-backend/public/`.

## 5. Configure `.env`
1. Copy `.env.example` → `.env` in the project root.
2. Set:
   ```
   CI_ENVIRONMENT = production
   app.baseURL = 'https://api.mandifresh.in/'
   database.default.hostname = localhost
   database.default.database = u123456789_mandifresh
   database.default.username = u123456789_mfuser
   database.default.password = <your DB password>
   ```
3. Make sure `.env` is **not** web-accessible (it lives outside `public/` by default — leave it there).

## 6. Create the schema + sample data

**If you have SSH (Business plan or higher):**
```bash
php spark migrate --all
php spark db:seed DatabaseSeeder
```

**If you're on basic shared hosting (no SSH):**
1. Open hPanel → **phpMyAdmin** for your database.
2. Import `database/mandifresh.sql` (Import tab → choose file → Go).
   This creates all 3 tables, seeds the 15 crops, and loads a 7-day sample of mandi_prices (432 rows) so the API works immediately.
3. Optional: for the full 30-day / 1000+ row dataset shown in the homepage stats, run the seeders locally against a dev database and export/import the resulting `mandi_prices` table instead.

## 7. Set folder permissions
```
writable/   -> 755 (CI4 needs to write cache/logs/session files here)
```
Hostinger's file manager defaults are usually fine; only adjust if you see permission errors in `writable/logs`.

## 8. Turn off the debug toolbar in production
Already handled by `CI_ENVIRONMENT = production` in `.env` — the toolbar filter only loads outside production, and CodeIgniter suppresses detailed error pages automatically.

## 9. Verify
- `https://api.mandifresh.in/` → should return the JSON health check from `Routes.php`.
- `https://api.mandifresh.in/api/dashboard` → should return live stats.
- `https://api.mandifresh.in/api/prices?per_page=5` → should return 5 price rows.

## 10. Point the static frontend at the API
In the frontend's `js/data.js` / `js/main.js` / `js/prices.js` / `js/calculator.js` (see `frontend-integration/` in this backend package), set:

```js
const API_BASE_URL = "https://api.mandifresh.in/api";
```

If the frontend is hosted on a different domain/subdomain than the API, keep `app/Filters/CorsFilter.php` enabled (it already is, globally) and — once you know your real frontend domain — replace the wildcard `Access-Control-Allow-Origin: *` with that exact origin for tighter security.

## 11. HTTPS
Hostinger issues a free SSL certificate automatically for the domain/subdomain (hPanel → SSL). Confirm `app.forceGlobalSecureRequests = true` is set in `.env` once SSL is active.
