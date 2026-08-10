# Deploying rtgeth.org to Bluehost (cPanel)

Target layout:

| Piece | Where |
|---|---|
| Public website (static `dist/`) | `public_html/` on rtgeth.org |
| API + CMS backend (`server/`) | cPanel **Node.js app** on subdomain `api.rtgeth.org`, app root `~/rtg-api` |
| Database | cPanel MySQL (e.g. `xxxx_rtgcms`) |
| Old WordPress site | **backed up, then removed** from public_html |

## 0. Back up the old WordPress site (do this first, always)

1. cPanel → **File Manager** → compress `public_html` → download `wordpress-backup-2026.zip`.
2. cPanel → **phpMyAdmin** → export the WordPress database (SQL format) → download.
3. Keep both files in RTG's records. The photo archive lives in `public_html/wp-content/uploads` — the backup preserves it.

## 1. Database

cPanel → **MySQL Databases**:
1. Create database, e.g. `<cpaneluser>_rtgcms`.
2. Create user `<cpaneluser>_rtg` with a strong password.
3. Add the user to the database with **ALL PRIVILEGES**.

## 2. API subdomain + Node app

1. cPanel → **Domains / Subdomains** → create `api.rtgeth.org` (document root can be `~/rtg-api/public` — Passenger ignores it mostly, but keep it out of public_html).
2. Upload the `server/` folder to `~/rtg-api` (SSH `scp`/`git clone`, or File Manager with `rtg-api.zip` from the `deploy/` folder).
3. Create `~/rtg-api/.env` from `.env.example` with:
   - `SITE_ORIGIN=https://rtgeth.org,https://www.rtgeth.org`
   - `API_ORIGIN=https://api.rtgeth.org`
   - the cPanel DB name/user/password from step 1
   - a long random `JWT_SECRET`, real `ADMIN_EMAIL`/`ADMIN_PASSWORD`
   - Chapa keys when available (test keys fine until then)
4. cPanel → **Setup Node.js App**:
   - Node version: 18+ (20 if offered) · Mode: Production
   - Application root: `rtg-api` · Application URL: `api.rtgeth.org` · Startup file: `app.js`
5. Click **Run NPM Install** (or SSH: `cd ~/rtg-api && npm install --omit=dev`).
6. From the app's shell (button in the Node.js App screen, or SSH with the app's env loaded):
   `npm run migrate && npm run seed`
7. Restart the app. Check `https://api.rtgeth.org/api/health` → `{"ok":true}`.

## 3. Frontend

1. Build locally with the production API URL (already configured in `.env.production`):
   `npm run build` → `dist/`.
2. Empty `public_html` (after step 0's backup!) and upload the contents of `dist/`
   (or `dist.zip` from `deploy/`, extracted in place). The included `.htaccess`
   handles SPA routes (`/admin`, `/donate/thanks`) and caching.
3. cPanel → **SSL/TLS Status**: run AutoSSL for rtgeth.org, www, and api subdomains.

## 4. Launch checks

- https://rtgeth.org loads the new site; `/admin` login works; an edit in the CMS appears on the site.
- Image upload works (writes to `~/rtg-api/uploads`).
- `/donate/thanks?tx_ref=RTG-x` shows the "no reference" state gracefully.
- With Chapa TEST keys: a 10 ETB sandbox donation completes end-to-end
  (checkout → webhook at `https://api.rtgeth.org/api/chapa/webhook` → thank-you page).
  Register that webhook URL in the Chapa dashboard.
- Email `info@rtgeth.org` still works (it's on this same Bluehost account — untouched).

## 5. Rollback

Restore `wordpress-backup-2026.zip` into `public_html` and re-import the SQL dump. The new
API on the subdomain doesn't conflict with the old site, so rollback is frontend-only.

## Redeploying updates later

- Frontend: `npm run build` locally → upload `dist/` contents again.
- API: upload changed `server/src` files → restart the Node app in cPanel.
