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
| section transitions | GSAP (Observer + timeline) | `ui/SectionStage` — fixed stacked panels, index-driven clip-wipe; the page itself never scrolls |
| scroll-animations   | Framer Motion  | `useInView` / `whileInView` entrances in `Work`, `About`, the category sheets |
| text-effects        | Framer Motion  | `About` (staggered line reveal) |
| background-effects  | Framer Motion  | Hero animated scroll-line indicator |

## Business Logic Generated

- `hooks/useLanguage.js` — language Context exposing `t` (the copy tree). The EN/IT toggle has been removed for now; `copy.json` is English-only and `LangToggle.jsx` is unused.
- `hooks/usePreloader.js` — preloader visibility timer + body scroll lock.
- `hooks/useNav.js` — mobile menu open/close state.
- `hooks/useWorkGallery.js` — the three nested gallery levels (category → project → image **page**): pill selection, Next Project cycling, and paged image navigation (`perPage` 1 mobile / 2 desktop) with clamp-on-resize, crossfade direction + media key.
- `hooks/useMediaQuery.js` — SSR-safe media-query hook; drives Work's 1-up (mobile) vs 2-up (desktop) layout.
- No API routes — no forms exist in the mockups (Contact removed).

## Reusable UI Components

- `components/ui/Nav.jsx` — single fixed nav shared by all sections; theme (light/dark text) follows the panel on stage, pushed by `SectionStage` from each panel's declared theme.
- `components/ui/ArrowButton.jsx` — square bordered arrow control; used for Work image up/down nav (light theme) and reusable elsewhere.
- `components/ui/Pill.jsx` — Work category tab with `layoutId` sliding active fill.
- `components/ui/LangToggle.jsx` — EN/IT toggle button (used in desktop nav + mobile menu).
- `components/ui/Preloader.jsx` — full-screen loading overlay.
- `components/ui/SectionStage.jsx` — the section engine at every tier: GSAP `Observer` turns wheel/touch into an index change, a timeline runs the clip-wipe. Owns the nav theme, the URL hash and the deep-link seed.
- `components/ui/PanelScroll.jsx` — per-panel scroll region, inert until its content outgrows the panel.

## Complexity Notes

- **Stale image references.** The mockups pointed at `../../assets/ds1-sculpture-*.jpg`, which no longer exist. Per direction, Hero → `homePage.jpg` and About → `b_3/aboutPage.jpg`. Work uses the real project folders.
- **Work taxonomy reshaped per direction.** Two categories instead of the mockup's four pills, mirroring the source folders `assets/adaptiveFlesh/` and `assets/physicalworks/`:
  - **Adaptive Flesh** — 3 projects: `adaptiveFlesh/b_1`, `b_2`, `b_3` (b_2 leads with its `.mp4` motion study).
  - **Physical** — 1 project (`physicalworks/misc`) with 4 images. (A "Coming soon" placeholder state still exists in code for any project whose media is a `placeholder` item, but Physical now has real images.)
- **About redesigned (revision).** The original blur-band treatment (and `useBlurBands`) was removed. About is now a left-image / right-text split per the supplied reference: `aboutPage.jpg` anchored left (`object-left`) dissolving into the dark text field via a token gradient (`from-transparent ... to-oxidized-graphite to-[58%]` on desktop), with ABOUT label → large bio → ARTIST STATEMENT label → statement → social links. Social links (Email / Instagram / X) live in `copy.json` under `about.social` with placeholder hrefs.
- **Fixed section stage, no page scroll (revision).** Replaced mobile scroll-snap. `y mandatory` snapping, a smooth fragment scroll, an rAF offset hold and a document whose height changed on scroll idle all wrote to the same scroll position, and the nav landed on whichever section the timing left it on — the bug was intermittent by construction. Sections are now panels stacked in a `position: fixed` root and moved by index, so there is no scroll position to disagree about. This also retired the whole viewport-unit cluster (`100lvh`/`svh`/`dvh`, the bottom-edge transform, the trailing spacer and the Safari UA sniff): with nothing to scroll, the URL bar never retracts and the viewport never resizes.
- **Section transition.** Ported from GSAP's "Animated Continuous Sections" pen: clipped outer/inner wrappers counter-slide so the incoming content holds still while its window wipes in, plus a 15% parallax drift on both panels. The transform lives *inside* each panel; `Nav` and the preloader are fixed siblings outside the stage, so nothing fixed sits under a transformed ancestor. Keep it that way — `.stage-root` is itself `position: fixed`, so a transform on any ancestor would also break its sizing.
- **Work images at native resolution (revision).** Images render `object-contain` at their natural aspect (no longer `object-cover` full-bleed, which upscaled/cropped and looked granulated) and use `unoptimized` so the original file resolution is served. Desktop shows two images side-by-side; the up/down arrows page through the project in steps of `perPage`.
- **Full-screen mobile menu (revision).** The nav's mobile menu is now a `fixed inset-0` overlay with large centred links + language toggle (was a dropdown), with body-scroll lock while open and the hamburger morphing into an X.
- **Animated hero scroll line.** The static scroll line is now a track with a light segment travelling downward on a loop (`motion.span` y-keyframes) to cue scrolling.
- **Single fixed nav vs. per-section navs.** The mockups drew a nav inside each section; this was consolidated into one fixed `Nav` that switches text colour with the panel on stage (each panel declares its theme; `SectionStage` pushes it by index).
- **Tonal gradient overlays** (Hero, Work vignette, About right-anchor) were re-expressed as token-based Tailwind gradient classes rather than the mockups' raw `rgba()` linear-gradients, to keep colours on design tokens.
- **`writing-mode: vertical-rl`** for the Hero "Scroll" label has no Tailwind equivalent — added as a `.vertical-text` utility in `globals.css`.
- **Cormorant weight 200 → 300** (see Design System).

## Asset Filename Issues

These source files contain spaces. They are **URL-encoded** in `assets.js` and work as-is, but should be renamed before launch (then update the encoded paths):

| Current path                                  | Suggested rename                         |
|-----------------------------------------------|------------------------------------------|
| `adaptiveFlesh/b_2/top_01_B copy.jpg`         | `adaptiveFlesh/b_2/top_01_B_copy.jpg`    |
| `adaptiveFlesh/b_3/full body_02.jpg`          | `adaptiveFlesh/b_3/full_body_02.jpg`     |
| `adaptiveFlesh/b_3/full body_04.jpg`          | `adaptiveFlesh/b_3/full_body_04.jpg`     |

The Physical Works images use an uppercase `.JPG` extension (`physicalworks/misc/IMG_*.JPG`); the paths in `assets.js` match that case exactly. Lowercasing the extensions is optional but tidier — update `assets.js` if you do.

## Assumptions

- **Project titles unknown** — every Work project title is a `[PLACEHOLDER: ...]` in `copy.json` (the mockup showed a sample "Untitled Form 02"). Replace before launch.
- **Italian removed for now** — the EN/IT toggle and the `it` copy block were removed at the client's request; `copy.json` is English-only. `useLanguage`/`LangToggle` remain in place so the toggle can be reinstated later.
- **Image ordering within projects** — folders had no explicit order, so images are ordered sensibly (hero/full-body shots first, close-ups/sides after; `b_2` leads with its video). Reorder in `assets.js` if the artist prefers a different sequence.
- **`adaptiveFlesh/b_3/aboutPage.jpg`** is treated as the About background and excluded from the `b_3` Work gallery.
- **Preloader duration** assumed at 2.2s (no value given in the mockup) — adjustable in `usePreloader`.
