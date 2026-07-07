# Sabrina Suppa — Build Report

Generated: 2026-06-07
Build status: **PASS** (`next build` compiled with zero errors; dev server verified, all assets resolve 200)

A portfolio site for sculptor Sabrina Suppa — Next.js App Router + Tailwind + Framer Motion, built directly from the `hero`, `work`, and `about` mockups. There is **no Contact section** (removed per request; the nav links were stripped from the mockups).

## Running the Project

### 1. Copy assets
The build already has assets copied into `public/`. If you re-clone or reset, copy them again:
```bash
cp -R ../assets/. public/assets/sabrina-suppa/
```

### 2. Install dependencies
```bash
cd output/sabrina-suppa/website
npm install
```

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:3000

> No environment variables are required — there is no contact form / API route.

---

## Screenshots

Captured at two viewports via headless Chrome (after the preloader, with each section scrolled into view so entrance animations fire).

| Section | Mobile (375px) | Desktop (1440px) |
|---------|----------------|------------------|
| Hero    | [home-mobile.png](screenshots/home-mobile.png)   | [home-desktop.png](screenshots/home-desktop.png)   |
| Work    | [work-mobile.png](screenshots/work-mobile.png)   | [work-desktop.png](screenshots/work-desktop.png)   |
| About   | [about-mobile.png](screenshots/about-mobile.png) | [about-desktop.png](screenshots/about-desktop.png) |

---

## Issues Found

No visual or build issues detected at the reviewed breakpoints. All three sections render faithfully to the mockups at 375px and 1440px; the preloader → hero entrance, Work pill/arrow/Next-Project navigation, and About blur bands all behave as designed.

Notes (not defects):
- **Hairline weight** — the mockups specify Cormorant weight 200, but `next/font/google` only ships Cormorant at weight 300+. The thinnest available (300) is loaded; `font-extralight` utilities fall back to it. Visually near-identical.
- **Physical category** is a single placeholder project — it shows a "Coming soon" state until the client supplies the image (see Pre-Launch Checklist).

---

## Content & CMS

Content is edited through the git-based CMS at **`/admin`** (Sveltia CMS) — see
[CMS_SETUP.md](CMS_SETUP.md). The editable source of truth lives in `src/content/` (singletons plus
per-category and per-project files); `scripts/build-content.mjs` assembles it into the
`*.generated.json` files the app imports (run automatically on `dev`/`build`). Do not edit the
generated files by hand.

## Pre-Launch Checklist

- [ ] Swap the Hero background for the final MP4 video when ready (currently `homePage.jpg` in `src/content/hero.json`)
- [ ] Complete the one-time CMS setup (R2, GitHub OAuth Worker, deploy secrets) — see [CMS_SETUP.md](CMS_SETUP.md)
- [ ] Verify fonts load in production (`npm run build && npm start`)

> English-only for now — the content is structured under an `en` locale for future languages. Social
> links and category/project descriptions are filled in with real copy.
- [ ] Run a Lighthouse audit
