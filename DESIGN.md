---
name: Sabrina Suppa
description: Portfolio for a "Body Architect" — cinematic specimen vitrine for adaptive morphologies.
colors:
  bone-porcelain: "#F3EEE8"
  synthetic-flesh: "#C9A48F"
  surgical-taupe: "#8F786C"
  oxidized-graphite: "#1A1A1C"
  wet-petroleum: "#22262B"
typography:
  display:
    fontFamily: "Copperplate Gothic Light, Copperplate, Georgia, serif"
    fontSize: "clamp(28px, 7.5vw, 46px)"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "0.08em"
  body:
    fontFamily: "Cormorant, Georgia, serif"
    fontSize: "clamp(1rem, 0.86rem + 0.7vw, 1.1rem)"
    fontWeight: 300
    lineHeight: 1.7
    letterSpacing: "0.01em"
  label:
    fontFamily: "futura-pt, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.30em"
rounded:
  none: "0"
  full: "9999px"
spacing:
  sm: "8px"
  md: "24px"
  lg: "36px"
  xl: "52px"
components:
  pill-active:
    backgroundColor: "{colors.oxidized-graphite}"
    textColor: "{colors.bone-porcelain}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "8px 22px"
  pill-inactive:
    backgroundColor: "{colors.bone-porcelain}"
    textColor: "{colors.oxidized-graphite}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "8px 22px"
  arrow-button:
    textColor: "{colors.oxidized-graphite}"
    rounded: "{rounded.none}"
    size: "36px"
  nav-link:
    textColor: "{colors.oxidized-graphite}"
    typography: "{typography.label}"
---

# Design System: Sabrina Suppa

## 1. Overview

**Creative North Star: "The Specimen Vitrine"**

The site is a clinical display case for a practice about the body under engineering. Work is presented as specimens — lit from the dark, held still, examined — and the interface is the vitrine: cold, exact glass that frames a charged, bodily subject without ever competing with it. The whole experience runs two registers of the same case. A **dark world** (the lit vitrine: `oxidized-graphite` ground, cinematic imagery, hairline serifs) carries atmosphere and first impression. A **light world** (the catalogue card: `bone-porcelain` ground, dark ink, taxonomic labels) carries the index — categories, projects, the artist record. The single fixed nav flips between them automatically (`data-nav-theme`), so moving through the site feels like turning a specimen from its dramatic display into its documentation and back.

Density is low and deliberate. One dominant idea per viewport, generous negative space, long controlled pacing. The system's depth is **soft and atmospheric, not stacked** — there are no drop shadows. Depth is conveyed the way it is in a dim gallery: tonal gradients that dissolve image into ground, opacity crossfades between states, a light segment travelling a scroll track, text-shadow used only to keep type legible over photography. Transitions behave like the work itself — membranes dissolving, states settling — never like UI chrome sliding around.

This system explicitly rejects the **generic Squarespace/template portfolio** (a white grid of thumbnails with no point of view), **startup/SaaS polish** (bright, rounded, gradient-accented, hero-metric energy), **gothic/horror kitsch** (the unease is clinical and refined, never skulls or gore), and **busy maximalism** (nothing on screen competes with the work). If a screen could belong to any other artist, it has failed the vitrine.

**Key Characteristics:**
- Two-world system: dark cinematic vitrine ↔ light catalogue index, nav auto-flips.
- Specimen-first: imagery leads, the interface recedes to glass.
- Atmospheric depth, zero drop shadows — dissolves, gradients, crossfades.
- Hairline, uppercase, widely-tracked typography as instrument labeling.
- Refined unease by precision and low light, never by shock.

## 2. Colors

A five-tone body-and-instrument palette: two grounds at the extremes (near-black graphite, warm porcelain) bridged by a flesh-to-taupe skin range, with a colder petroleum for secondary dark surfaces. Warm skin tones sit against cold graphite — the tension is the point.

### Primary
- **Oxidized Graphite** (`#1A1A1C`): The dark ground and the ink. It is the `body` background, the dark-world surface (Hero, mobile menu, mobile About), the solid fill of an active pill, and the text color on every light surface. The vitrine's black glass.

### Secondary
- **Bone Porcelain** (`#F3EEE8`): The light ground and the light-world type. Background of the Work index and the desktop About panel; the text color on every dark surface. Warm enough to read as bone/porcelain, never as clinical white.

### Tertiary
- **Synthetic Flesh** (`#C9A48F`): The one accent. Used sparingly and with intent — the preloader descriptor, the hover color on social links. A warm skin tone that signals the bodily subject; it is never a UI fill.
- **Surgical Taupe** (`#8F786C`): The muted mid-tone bridging flesh to graphite. For secondary/quieter labels and transitional passages between the two worlds.

### Neutral
- **Wet Petroleum** (`#22262B`): A colder, slightly lifted dark surface for secondary panels and layering against `oxidized-graphite`. The only "elevation" the palette offers is this tonal step, not a shadow.

### Named Rules
**The Two-Worlds Rule.** Every surface is either dark-world (`oxidized-graphite` ground, `bone-porcelain` type, `data-nav-theme="dark"`) or light-world (`bone-porcelain` ground, `oxidized-graphite` type, `data-nav-theme="light"`). There is no third ground. New sections declare their world; they never invent a mid-gray in between.

**The One-Skin Rule.** `synthetic-flesh` is the only accent and it is rare — reserved for moments that reference the body (accents, hovers, the descriptor). It is prohibited as a button fill, a background, or a section device. Its scarcity is what makes it read as flesh and not as brand color.

## 3. Typography

**Display Font:** Copperplate Gothic Light (with Copperplate, Georgia, serif) — glyphic, engraved, museum-plaque authority.
**Body Font:** Cormorant (with Georgia, serif) — a fine, high-contrast serif carried at light weights (300) with italic in play.
**Label Font:** futura-pt (Adobe Fonts, sans) — geometric caps for descriptors and micro-labels.

**Character:** An engraved glyphic display against a hairline literary serif, punctuated by cold geometric caps. Copperplate labels the specimen like a brass museum plate; Cormorant is the reading voice — thin, elegant, slightly uneasy; Futura is the instrument reading. Three families, each doing one job, none interchangeable.

### Hierarchy
- **Display / Name** (Copperplate 300, `clamp(28px, 7.5vw, 46px)`, line-height 1.1, tracking 0.08em): The artist name in the Hero and preloader, and the large ABOUT plate. Always uppercase, always tracked. The engraved plaque.
- **Section Plate** (Copperplate 300, ~14px, uppercase, tracking 0.20–0.28em): Nav logo, nav links, section labels ("ABOUT", category names). The taxonomic labeling layer.
- **Descriptor / Label** (futura-pt 400, 12px, uppercase, tracking 0.30–0.34em): "Body Architect · Exploring Adaptive Morphologies", scroll cue, micro-labels. The instrument reading.
- **Body** (Cormorant 300, `clamp(1rem … 1.1rem)`, line-height 1.7, tracking 0.01em): Bios, project descriptions, statements. Held at `max-w-[60ch]`. Light weight is intentional; do not bump to 400 for "readability" — increase size/contrast instead.
- **Signature Italic** (Cormorant italic, extralight, `text-3xl`/`text-4xl`, tracking 0.08em): The preloader name only. A single expressive flourish before the clinical system takes over.

### Named Rules
**The Tracked-Caps Rule.** Every Copperplate and Futura label is uppercase and widely tracked (≥0.20em). Sentence-case display type is forbidden; these fonts are labels, not headlines.

**The Hairline Rule.** Cormorant body always runs at weight 300, never bolder. The thin literary line is the reading voice of the whole system; a heavier body weight reads as a different, wrong site.

## 4. Elevation

Flat by doctrine. The system uses **no `box-shadow`** anywhere. Depth is atmospheric, achieved through four materials only: (1) tonal gradients that dissolve imagery into the graphite ground (`bg-gradient-to-t from-oxidized-graphite via-oxidized-graphite/80 to-transparent`), (2) opacity crossfades between gallery images and section states, (3) the `wet-petroleum` tonal step for secondary dark surfaces, and (4) `text-shadow` used *functionally* — only to hold type legible over photography (`0 2px 18px rgba(26,26,28,0.6)`), never as decoration. Controls sit flat on their surface; they gain presence by inverting on hover, not by lifting.

### Named Rules
**The No-Shadow Rule.** Drop shadows are prohibited. If an element needs separation, use a tonal gradient, an opacity dissolve, or the `wet-petroleum` surface step. A box-shadow anywhere in this system is a bug.

**The Functional-Glow Rule.** `text-shadow` exists to keep light type readable over dark imagery and nothing else. It is never applied to type on a solid surface for effect.

## 5. Components

Controls are minimal and instrumental — thin lines, tracked caps, invert-on-hover — so they recede into the atmosphere and let the specimen hold the room.

### Pills (Work category tabs)
- **Shape:** Fully rounded (`rounded-full`), padding `8px 22px`.
- **Active:** Solid `oxidized-graphite` fill, `bone-porcelain` label. The fill slides between pills via a shared `layoutId` spring (stiffness 380, damping 34) — a single dark cell migrating across the taxonomy.
- **Inactive:** Dashed hairline border (`oxidized-graphite/40`) over a translucent `bone-porcelain/50` fill, `oxidized-graphite` label. Dashed = provisional, not yet selected.
- **Label:** 9.5px, uppercase, tracking 0.20em.

### Arrow Buttons (gallery / Next Project)
- **Shape:** Square, no radius. 36px default, 38px large.
- **Style:** 1px border at 30% opacity of the world's ink; transparent fill; glyph in the ink color.
- **Hover / Focus:** Full color inversion — border color floods the fill, glyph flips to the ground color; `scale 1.05` on hover, `0.94` on tap (200ms). Theme-aware: `light` (dark-on-light) and `dark` (light-on-dark) variants.

### Navigation
- **Style:** Single fixed bar, transparent, `px-6 py-7` (`md:px-[52px]`). No background, no border — it floats over whichever world is beneath it.
- **Typography:** Copperplate, 14px, uppercase, tracking 0.20–0.28em.
- **States:** Links rest at ~55–65% ink opacity, rise to full on hover (300ms). Color auto-flips via `data-nav-theme` + IntersectionObserver reading the section below.
- **Mobile:** Hamburger (two 1px rules) morphs into an X; opens a full-screen `oxidized-graphite` overlay with large centered Copperplate links (staggered entrance) and social icons at the base. Body scroll locks while open.

### Signature: The Section Dissolve
- Each full-viewport section is wrapped in a scroll-linked crossfade (`SectionFade`): opacity maps to scroll progress `[0.15, 1, 1, 0.15]`, opacity-only so fixed elements (nav, preloader) stay anchored. Adjacent sections dissolve *through* the dark ground rather than sliding — the membrane logic of the work, expressed as page transition.

## 6. Do's and Don'ts

### Do:
- **Do** anchor every surface to one of the two worlds (dark `#1A1A1C` ground / `#F3EEE8` type, or light `#F3EEE8` ground / `#1A1A1C` type) and declare its `data-nav-theme`.
- **Do** let imagery lead — the specimen holds the room; type, spacing, and motion frame it.
- **Do** keep all display/label type uppercase and tracked ≥0.20em (Copperplate) and body type Cormorant weight 300.
- **Do** convey depth with tonal gradients, opacity dissolves, and the `wet-petroleum` step — atmospheric, not stacked.
- **Do** reserve `synthetic-flesh` (`#C9A48F`) for rare, body-referencing accents and hovers only.
- **Do** hold body measure at ~60ch and keep the cinematic motion behind a `prefers-reduced-motion` crossfade fallback.

### Don't:
- **Don't** ship a **generic Squarespace/template portfolio** — a white grid of equal thumbnails with a neutral sans and no point of view.
- **Don't** apply **startup/SaaS polish**: no bright/rounded/gradient-accent styling, no hero-metric blocks, no product-landing cadence.
- **Don't** drift into **gothic/horror kitsch** — no skulls, gore, blood-drip, or Halloween darkness. The unease is clinical and refined.
- **Don't** go **busy or maximalist**: no clutter, no loud stacking, no animation for its own sake competing with the work.
- **Don't** add a `box-shadow` anywhere — a drop shadow in this system is a bug (see The No-Shadow Rule).
- **Don't** use `synthetic-flesh` as a button fill, background, or section device; don't invent a third mid-gray ground; don't set body type above weight 300.
