# Sabrina Suppa — Build Summary

Generated: 2026-06-07

## What Was Built

**Sections (page order):**
- **Hero** — `mockups/hero.html`
- **Work** — `mockups/work.html`
- **About** — `mockups/about.html`

**Skipped:** Contact — removed per request (no mockup; the section no longer exists). Its only trace was a nav link, which was deleted from all three mockup files before building.

## Design System

**Color tokens extracted** (from each mockup's `:root`):

| Tailwind name      | Hex      | Source variable        |
|--------------------|----------|------------------------|
| bone-porcelain     | #F3EEE8  | `--bone-porcelain`     |
| synthetic-flesh    | #C9A48F  | `--synthetic-flesh`    |
| surgical-taupe     | #8F786C  | `--surgical-taupe`     |
| oxidized-graphite  | #1A1A1C  | `--oxidized-graphite`  |
| wet-petroleum      | #22262B  | `--wet-petroleum`      |

**Fonts configured:**
- **Cormorant** via `next/font/google` — weights 300/400/500, styles normal + italic.
- Applied as CSS variable `--font-cormorant`, mapped to Tailwind `font-cormorant`.
- Mockups requested weight 200; `next/font` only offers Cormorant ≥300, so 300 is the thinnest loaded (documented in Complexity Notes).

## Animation Libraries

Installed: `framer-motion`, `@react-spring/web`

| Element type        | Library        | Applied to |
|---------------------|----------------|------------|
| page-transitions    | React Spring   | `PageTransitionWrapper` (wraps page content in layout) |
| loading             | Framer Motion  | `ui/Preloader` (AnimatePresence exit) |
| hero                | Framer Motion  | `sections/Hero` (staggered entrance, gated on preloader) |
| navigation          | Framer Motion  | `ui/Nav` (AnimatePresence mobile menu) |
| buttons-cta         | Framer Motion  | `ui/ArrowButton`, `ui/Pill` (whileHover/Tap, `layoutId` sliding pill) |
| images              | Framer Motion  | `sections/Work` (AnimatePresence crossfade on media change) |
| scroll-animations   | Framer Motion  | `useInView` entrance in `Work` + `About` |
| text-effects        | Framer Motion  | `About` (staggered line reveal) |
| background-effects  | (CSS)          | `About` blur bands — see Complexity Notes |

## Business Logic Generated

- `hooks/useLanguage.js` — EN/IT language Context + toggle; exposes `t` (active-language copy tree).
- `hooks/usePreloader.js` — preloader visibility timer + body scroll lock.
- `hooks/useNav.js` — mobile menu open/close state.
- `hooks/useWorkGallery.js` — the three nested gallery levels (category → project → image): pill selection, Next Project cycling, up/down image cycling, crossfade direction + media key.
- `hooks/useBlurBands.js` — responsive vertical blur-band geometry for About (3/5/7/10 bands by viewport).
- No API routes — no forms exist in the mockups (Contact removed).

## Reusable UI Components

- `components/ui/Nav.jsx` — single fixed nav shared by all sections; theme (light/dark text) adapts via IntersectionObserver reading each section's `data-nav-theme`.
- `components/ui/ArrowButton.jsx` — square bordered arrow control; used for Work image up/down nav (light theme) and reusable elsewhere.
- `components/ui/Pill.jsx` — Work category tab with `layoutId` sliding active fill.
- `components/ui/LangToggle.jsx` — EN/IT toggle button (used in desktop nav + mobile menu).
- `components/ui/Preloader.jsx` — full-screen loading overlay.

## Complexity Notes

- **Stale image references.** The mockups pointed at `../../assets/ds1-sculpture-*.jpg`, which no longer exist. Per direction, Hero → `homePage.jpg` and About → `b_3/aboutPage.jpg`. Work uses the real project folders.
- **Work taxonomy reshaped per direction.** Two categories instead of the mockup's four pills:
  - **Adaptive Flesh** — 3 projects: `b_1`, `b_2`, `b_3` (b_2 leads with its `.mp4` motion study).
  - **Physical** — 1 project, single image, supplied later (renders a "Coming soon" placeholder state).
- **About blur bands.** `backdrop-filter: blur()` amounts are computed per band and increase left→right, so each band's blur is set via **inline style** (Tailwind can't express the dynamic value) — the one sanctioned inline-style exception. Band count is viewport-responsive via `useBlurBands` (3/5/7/10), generalizing the mockup's per-breakpoint media queries with an even blur ramp.
- **Single fixed nav vs. per-section navs.** The mockups drew a nav inside each section; for a single scrolling page this was consolidated into one fixed `Nav` that switches text colour based on the section under it (`data-nav-theme` + IntersectionObserver).
- **Tonal gradient overlays** (Hero, Work vignette, About right-anchor) were re-expressed as token-based Tailwind gradient classes rather than the mockups' raw `rgba()` linear-gradients, to keep colours on design tokens.
- **`writing-mode: vertical-rl`** for the Hero "Scroll" label has no Tailwind equivalent — added as a `.vertical-text` utility in `globals.css`.
- **Cormorant weight 200 → 300** (see Design System).

## Asset Filename Issues

These source files contain spaces. They are **URL-encoded** in `assets.js` and work as-is, but should be renamed before launch (then update the encoded paths):

| Current path                         | Suggested rename                |
|--------------------------------------|---------------------------------|
| `b_2/top_01_B copy.jpg`              | `b_2/top_01_B_copy.jpg`         |
| `b_3/full body_02.jpg`               | `b_3/full_body_02.jpg`          |
| `b_3/full body_04.jpg`               | `b_3/full_body_04.jpg`          |

## Assumptions

- **Project titles unknown** — every Work project title is a `[PLACEHOLDER: ...]` in `copy.json` (the mockup showed a sample "Untitled Form 02"). Replace before launch.
- **Italian copy** — all `it` strings are `[TRANSLATE: ...]` mirrors of the English; the language toggle is fully wired and will swap them live once filled in.
- **Image ordering within projects** — folders had no explicit order, so images are ordered sensibly (hero/full-body shots first, close-ups/sides after; `b_2` leads with its video). Reorder in `assets.js` if the artist prefers a different sequence.
- **`b_3/aboutPage.jpg`** is treated as the About background and excluded from the `b_3` Work gallery.
- **Preloader duration** assumed at 2.2s (no value given in the mockup) — adjustable in `usePreloader`.
