# rtgeth.org on Bluehost (cPanel) — as deployed 2026-08-11

The Bluehost plan has **no Node.js support**, so the CMS backend is the PHP port
in `php-api/` (endpoint-identical to `server/`, which remains for local dev and
any future VPS move). Everything runs on the one shared-hosting account:

| Piece | Where |
|---|---|
| Public website (static `dist/`) | `public_html/` |
| API (PHP 8.3, no dependencies) | `public_html/api/{index.php,lib.php}` — routed via `.htaccess`, same-origin `/api/*` |
| Config + secrets | `~/rtg-api-config.php` (**outside** the docroot, chmod 600) |
| Migrate/seed CLI | `~/rtg-api/{seed.php,schema.sql,seed-data.json}` |
| Uploads | `public_html/uploads/` (`.htaccess` denies script execution) |
| Database | cPanel MySQL `odzdpnmy_rtgcms`, user `odzdpnmy_rtg` |
| Old WordPress | parked in `~/wordpress-old-site/`; backups in `~/backups/` and locally in `deploy/backups/` |

The frontend is built with `VITE_API_URL=` (empty → same-origin), so there is no
API subdomain and no CORS in play.

## Redeploying updates

Frontend (from the repo root, on Windows use Git Bash):

```sh
npm run build
tar -czf deploy/dist.tar.gz -C dist .
scp -i ~/.ssh/rtg_bluehost deploy/dist.tar.gz odzdpnmy@50.6.34.129:dist.tar.gz
ssh -i ~/.ssh/rtg_bluehost odzdpnmy@50.6.34.129 'tar -xzf ~/dist.tar.gz -C ~/public_html && rm ~/dist.tar.gz'
```

API:

```sh
scp -i ~/.ssh/rtg_bluehost php-api/api/index.php php-api/api/lib.php odzdpnmy@50.6.34.129:public_html/api/
```

Schema/seed changes (idempotent — never overwrites live edits):

```sh
scp -i ~/.ssh/rtg_bluehost php-api/seed.php php-api/schema.sql php-api/seed-data.json odzdpnmy@50.6.34.129:rtg-api/
ssh -i ~/.ssh/rtg_bluehost odzdpnmy@50.6.34.129 'php ~/rtg-api/seed.php'
```

## Chapa go-live checklist (when RTG's account is verified)

1. Edit `~/rtg-api-config.php` on the server: set `CHAPA_SECRET_KEY` (live key)
   and `CHAPA_WEBHOOK_SECRET`.
2. In the Chapa dashboard, register the webhook: `https://rtgeth.org/api/chapa/webhook`.
3. Test with a 10 ETB donation end-to-end (checkout → webhook → `/donate/thanks`).
   With TEST keys first if Chapa provides them.

## Operational notes

- **Mod_Security** is active: it 406-blocks bodyless POSTs to the API. Normal
  JSON requests (and real Chapa webhooks) pass. If Chapa deliveries ever 406,
  ask Bluehost support to whitelist `/api/chapa/webhook`.
- Long SSH/scp transfers (100 MB+) get reset by Bluehost — use
  `-o ServerAliveInterval=15` and retry, or run server-side via `nohup`.
- Bulk file moves in `public_html` may need to be run by a human (permission
  classifier blocks them in auto mode).
- Admin panel: `https://rtgeth.org/admin` — credentials in `deploy/bluehost-secrets.txt`
  (gitignored) until handover; change the password at handover.
- Email `info@rtgeth.org` lives on the same account — untouched by all of this.

## Rollback to WordPress

```sh
ssh -i ~/.ssh/rtg_bluehost odzdpnmy@50.6.34.129
mv ~/public_html/{index.html,assets,api,uploads,.htaccess} ~/rtg-site-parked/
mv ~/wordpress-old-site/* ~/wordpress-old-site/.htaccess ~/public_html/
```

(DB dump also in `~/backups/wordpress-db-2026-07-31.sql` if the WP database is
ever damaged; WP database `odzdpnmy_WPNut` was never touched.)
