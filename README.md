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

## Pre-Launch Checklist

- [ ] Replace `[PLACEHOLDER: ...]` project titles in `src/content/copy.json` (Work section, both `en` and `it`)
- [ ] Replace all `[TRANSLATE: ...]` values in `src/content/copy.json` with real Italian copy
- [ ] Supply the **Physical** category image and add it to `src/lib/assets.js` (`workMedia.physical[0].media`), replacing the placeholder
- [ ] Fill in the **About social links** — `about.social` in `src/content/copy.json` (Email / Instagram / X handles, both `en` and `it`), currently `[PLACEHOLDER: ...]` hrefs
- [ ] Swap the Hero background for the final MP4 video when ready (currently `homePage.jpg`)
- [ ] Rename asset files containing spaces (see SUMMARY.md) and update the encoded paths in `assets.js`
- [ ] Confirm final EN/IT bio + artist statement copy
- [ ] Verify fonts load in production (`npm run build && npm start`)
- [ ] Run a Lighthouse audit
