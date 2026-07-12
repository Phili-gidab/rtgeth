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

## Deployment

Deployed on Vercel from this repo's `main` branch. Vercel auto-detects Vite
(`npm run build` → `dist/`); `vercel.json` pins the config and adds immutable
caching for hashed assets. No environment variables required.

## Content status

Program data comes from the 2026-07 team field notes; photography is from the
organization's 2022 gallery. Pending from the client: donation payment method
(currently bank transfer only), new 2025–26 photos, Amharic/Swedish translations.
