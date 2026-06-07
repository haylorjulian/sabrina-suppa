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
| images              | Framer Motion  | `sections/Work` (AnimatePresence crossfade on media/page change) |
| scroll-animations   | Framer Motion + CSS | `useInView` entrance in `Work` + `About`; `ui/SectionFade` scroll-linked crossfade; CSS scroll-snap |
| text-effects        | Framer Motion  | `About` (staggered line reveal) |
| background-effects  | Framer Motion  | Hero animated scroll-line indicator |

## Business Logic Generated

- `hooks/useLanguage.js` — EN/IT language Context + toggle; exposes `t` (active-language copy tree).
- `hooks/usePreloader.js` — preloader visibility timer + body scroll lock.
- `hooks/useNav.js` — mobile menu open/close state.
- `hooks/useWorkGallery.js` — the three nested gallery levels (category → project → image **page**): pill selection, Next Project cycling, and paged image navigation (`perPage` 1 mobile / 2 desktop) with clamp-on-resize, crossfade direction + media key.
- `hooks/useMediaQuery.js` — SSR-safe media-query hook; drives Work's 1-up (mobile) vs 2-up (desktop) layout.
- No API routes — no forms exist in the mockups (Contact removed).

## Reusable UI Components

- `components/ui/Nav.jsx` — single fixed nav shared by all sections; theme (light/dark text) adapts via IntersectionObserver reading each section's `data-nav-theme`.
- `components/ui/ArrowButton.jsx` — square bordered arrow control; used for Work image up/down nav (light theme) and reusable elsewhere.
- `components/ui/Pill.jsx` — Work category tab with `layoutId` sliding active fill.
- `components/ui/LangToggle.jsx` — EN/IT toggle button (used in desktop nav + mobile menu).
- `components/ui/Preloader.jsx` — full-screen loading overlay.
- `components/ui/SectionFade.jsx` — one scroll-snap slide; opacity-only scroll-linked crossfade so adjacent sections dissolve through the dark page background.

## Complexity Notes

- **Stale image references.** The mockups pointed at `../../assets/ds1-sculpture-*.jpg`, which no longer exist. Per direction, Hero → `homePage.jpg` and About → `b_3/aboutPage.jpg`. Work uses the real project folders.
- **Work taxonomy reshaped per direction.** Two categories instead of the mockup's four pills:
  - **Adaptive Flesh** — 3 projects: `b_1`, `b_2`, `b_3` (b_2 leads with its `.mp4` motion study).
  - **Physical** — 1 project, single image, supplied later (renders a "Coming soon" placeholder state).
- **About redesigned (revision).** The original blur-band treatment (and `useBlurBands`) was removed. About is now a left-image / right-text split per the supplied reference: `aboutPage.jpg` anchored left (`object-left`) dissolving into the dark text field via a token gradient (`from-transparent ... to-oxidized-graphite to-[58%]` on desktop), with ABOUT label → large bio → ARTIST STATEMENT label → statement → social links. Social links (Email / Instagram / X) live in `copy.json` under `about.social` with placeholder hrefs.
- **Full-viewport sections + scroll snap (revision).** Sections now fill exactly one viewport using `100svh` (small-viewport units — fixes mobile overflow caused by `100vh` + browser chrome; `min-h-[600px]` was removed). `html` uses `scroll-snap-type: y mandatory`; each section is wrapped in `SectionFade` (`snap-start`) which both provides the `100svh` height and applies the scroll-linked opacity crossfade. Mandatory snap guarantees rest states land centred (opacity 1), so sections never sit dimmed.
- **Section crossfade.** `SectionFade` uses `useScroll` + `useTransform` mapping scroll progress → opacity `[0.15, 1, 1, 0.15]`. Opacity only (no transform) so the hero's `fixed` preloader and the `fixed` nav stay viewport-fixed (transform on an ancestor would have re-anchored them).
- **Work images at native resolution (revision).** Images render `object-contain` at their natural aspect (no longer `object-cover` full-bleed, which upscaled/cropped and looked granulated) and use `unoptimized` so the original file resolution is served. Desktop shows two images side-by-side; the up/down arrows page through the project in steps of `perPage`.
- **Full-screen mobile menu (revision).** The nav's mobile menu is now a `fixed inset-0` overlay with large centred links + language toggle (was a dropdown), with body-scroll lock while open and the hamburger morphing into an X.
- **Animated hero scroll line.** The static scroll line is now a track with a light segment travelling downward on a loop (`motion.span` y-keyframes) to cue scrolling.
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
