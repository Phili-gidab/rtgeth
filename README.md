# RTG — Rescue The Generation, website redesign

Redesign of [rtgeth.org](https://rtgeth.org/) around the organization's motto
**ያገባኛል (Yagebanal) — "It concerns me! I am responsible!"**

## Stack

- **Vite + React 19**
- **GSAP + ScrollTrigger** — intro timeline, masked reveals, drawn hairlines, counters, parallax, velocity-reactive marquee
- **Lenis** — smooth scrolling (skipped when `prefers-reduced-motion`)
- Hand-rolled CSS design tokens (dark canonical + light theme, `prefers-color-scheme` + `data-theme` override)
- Self-hosted fonts: Big Shoulders (display), Newsreader (body), Noto Serif Ethiopic subset (motto + Ge'ez numerals)

## Commands

```bash
npm install
npm run dev          # local dev server
npm run build        # production build → dist/
npm run build:single # one-file build (all assets inlined) → dist-single/, used for the shareable preview
```

## Structure

- `src/data/content.js` — every word and number on the site, in one file
- `src/components/` — one component per section
- `src/styles/global.css` — tokens + all styling
- `docs/site-audit.md` — content inventory + UX audit of the old site
- `docs/prototype-v1-standalone.html` — the original static design concept (v1)

## Phase 2 — CMS, donations, API

- `server/` — portable Express + MySQL API: JWT auth, singleton + generic-collection
  content CRUD, image uploads (local disk), public form submissions, and the full
  **Chapa** donation flow (init → hosted checkout → signed webhook → server-side
  re-verify with amount matching → thank-you poll). Runs identically on AWS or a
  cPanel Node.js app. Setup: `cp .env.example .env`, `npm i`, `npm run migrate`,
  `npm run seed`, `npm run dev` (local MySQL: `docker run -d --name rtg-mysql
  -e MYSQL_ROOT_PASSWORD=rtgdev -e MYSQL_DATABASE=rtg_cms -p 3306:3306 mysql:8.4`).
- `/admin` — CMS panel in the same SPA (lazy chunk). One schema registry
  (`src/admin/schemas.js`) provisions every editable section: 5 singleton sections +
  8 collections (programs, stats, gallery, people, FAQ, partners, tiers, updates),
  uploads, reordering, publish toggles, donations ledger and submissions inbox.
  Default login is seeded from `server/.env`.
- Public site reads `/api/content` and **falls back to bundled defaults** if the
  API is down — the site can never render empty.
- `infra/` — Terraform for the mform AWS account: one Lightsail VM (nginx + Node +
  MariaDB — deliberately the same shape as a cPanel host, so migration later is
  copy + mysqldump). `terraform apply`, point DNS, run certbot, set real Chapa keys.
- **Pending credentials:** `CHAPA_SECRET_KEY` + `CHAPA_WEBHOOK_SECRET` (RTG's Chapa
  account not yet created — test keys work end-to-end against Chapa sandbox), and
  fresh mform AWS keys (current ones are expired).

## Deployment

Deployed on Vercel from this repo's `main` branch. Vercel auto-detects Vite
(`npm run build` → `dist/`); `vercel.json` pins the config and adds immutable
caching for hashed assets. No environment variables required.

## Content status

Program data comes from the 2026-07 team field notes; photography is from the
organization's 2022 gallery. Pending from the client: donation payment method
(currently bank transfer only), new 2025–26 photos, Amharic/Swedish translations.
