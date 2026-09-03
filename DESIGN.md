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
  hero-chrome: "32px"
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

Density is low and deliberate. One dominant idea per viewport, generous negative space, long controlled pacing. The system's depth is **soft and atmospheric, not stacked** — no structural drop shadows. Depth is conveyed the way it is in a dim gallery: tonal gradients that dissolve image into ground, opacity crossfades between states, a light segment travelling a scroll track, text-shadow used only to keep type legible over photography. Controls are the one place light gathers — at rest they nearly vanish into the ground and, on attention, catch a soft emergent glow (see §4). Transitions behave like the work itself — membranes dissolving, states settling — never like UI chrome sliding around.

This system explicitly rejects the **generic Squarespace/template portfolio** (a white grid of thumbnails with no point of view), **startup/SaaS polish** (bright, rounded, gradient-accented, hero-metric energy), **gothic/horror kitsch** (the unease is clinical and refined, never skulls or gore), and **busy maximalism** (nothing on screen competes with the work). If a screen could belong to any other artist, it has failed the vitrine.

**Key Characteristics:**
- Two-world system: dark cinematic vitrine ↔ light catalogue index, nav auto-flips.
- Specimen-first: imagery leads, the interface recedes to glass.
- Atmospheric depth, no structural drop shadows — dissolves, gradients, crossfades, plus soft emergent glow on controls.
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

**The One-Skin Rule.** `synthetic-flesh` is the only accent and it is rare — reserved for moments that reference the body (text accents, hovers, the descriptor, and the nav-link underglow). It is prohibited as a *static* button fill, a background, or a section device. Its scarcity is what makes it read as flesh and not as brand color.

**The One-Line Rule.** Every rule, tick, hairline border and ring on the site is `bone-porcelain` in the dark world and `oxidized-graphite` in the light world — never flesh. Lines carry state through *opacity and length only* (an active project tick is porcelain at full opacity beside siblings at `/25`, `/50` on hover); a line never changes hue to mean something. This is what keeps flesh legible as an accent when it does appear.

## 3. Typography

**Display Font:** Copperplate Gothic Light (with Copperplate, Georgia, serif) — glyphic, engraved, museum-plaque authority.
**Body Font:** Cormorant (with Georgia, serif) — a fine, high-contrast serif carried at light weights (300) with italic in play.
**Label Font:** futura-pt (Adobe Fonts, sans) — geometric caps for descriptors and micro-labels.

**Character:** An engraved glyphic display against a hairline literary serif, punctuated by cold geometric caps. Copperplate labels the specimen like a brass museum plate; Cormorant is the reading voice — thin, elegant, slightly uneasy; Futura is the instrument reading. Three families, each doing one job, none interchangeable.

### Hierarchy
- **Display / Name** (Copperplate 300, `clamp(28px, 7.5vw, 46px)`, line-height 1.1, tracking 0.08em): The artist name in the Hero, and the large ABOUT plate. Always uppercase, always tracked. The engraved plaque. The desktop Hero wordmark is the one exception, held at `clamp(24px, 3.4vw, 37px)`: it sits bottom-left against the right rail and the footer strip, and at the full display scale it overpowers the specimen rather than framing it.
- **Section Plate** (Copperplate 300, ~14px, uppercase, tracking 0.20–0.28em): Nav logo, nav links, section labels ("ABOUT", category names). The taxonomic labeling layer.
- **Descriptor / Label** (futura-pt 400, 12px, uppercase, tracking 0.20–0.34em): The Hero footer strip ("LONDON, UK", the copyright), the scroll cue, micro-labels. The instrument reading. The positioning line "Body Architect" is brand strategy (see PRODUCT.md) but is deliberately unrendered — the Hero states the name and shows the work.
- **Body** (Cormorant 300, `clamp(1rem … 1.1rem)`, line-height 1.7, tracking 0.01em): Bios, project descriptions, statements. Held at `max-w-[60ch]`. Light weight is intentional; do not bump to 400 for "readability" — increase size/contrast instead.
- **Signature Italic** (Cormorant italic, extralight, `text-3xl`/`text-4xl`, tracking 0.08em): The preloader name only. A single expressive flourish before the clinical system takes over.

### Named Rules
**The Tracked-Caps Rule.** Every Copperplate and Futura label is uppercase and widely tracked (≥0.20em). Sentence-case display type is forbidden; these fonts are labels, not headlines.

**The Hairline Rule.** Cormorant body always runs at weight 300, never bolder. The thin literary line is the reading voice of the whole system; a heavier body weight reads as a different, wrong site.

## 4. Elevation

Structurally flat, softly lit. There are **no directional drop shadows** simulating stacked panels. Surface depth is atmospheric, through four materials: (1) tonal gradients that dissolve imagery into the graphite ground (`bg-gradient-to-t from-oxidized-graphite via-oxidized-graphite/80 to-transparent`), (2) opacity crossfades between gallery images and section states, (3) the `wet-petroleum` tonal step for secondary dark surfaces, and (4) `text-shadow` used *functionally* — only to hold type legible over photography (`0 2px 18px rgba(26,26,28,0.6)`), never as decoration.

**Controls are the one place light is allowed to gather.** They carry an *emergent light*: at rest a control nearly dissolves into its ground, and attention (hover / focus) raises a soft, diffuse glow — a porcelain bloom in the dark world (`--glow-bone`), an ink penumbra in the light world (`--penumbra-ink`), with a ≤3px `backdrop-blur` lifting it off the imagery behind. The glow is soft and non-directional (no offset that reads as elevation); it responds to state and settles back. This is emergent-from-shadow, deliberately **not** glassmorphism.

### Named Rules
**The Emergent-Light Rule.** Structural drop shadows are prohibited — no directional offset simulating a lifted panel. Shadow is permitted *only* as emergent light on controls: soft, diffuse, porcelain- or ink-toned, tied to state, tokenized as `--glow-bone` / `--penumbra-ink`. A hard offset drop shadow anywhere is still a bug.

**The Glass-Is-For-Controls Rule.** `backdrop-filter: blur()` is allowed only as a ≤3px functional lift of an *interactive control* off imagery. Frosted panels, glass cards, and decorative blur on surfaces remain prohibited.

**The Functional-Glow Rule.** `text-shadow` exists to keep light type readable over dark imagery, and the nav-link underglow (`--glow-underlay`) to raise a link on hover. Neither is applied to static type on a solid surface for effect.

## 5. Components

Controls are minimal and instrumental — thin lines, tracked caps — that recede into the atmosphere at rest and catch a soft emergent light on attention, so the specimen holds the room.

### Pills (Work category tabs)
- **Shape:** Fully rounded (`rounded-full`), padding `8px 22px`.
- **Active:** Solid `oxidized-graphite` lozenge, `bone-porcelain` label, floating on a soft ink penumbra with a faint `bone-halo` ring (`--penumbra-ink, --bone-halo`). The fill slides between pills via a shared `layoutId` spring (stiffness 380, damping 34) — a single dark cell migrating across the taxonomy.
- **Inactive:** A quiet form — hairline `oxidized-graphite/10` border over a `surgical-taupe/5` fill with a 3px `backdrop-blur`, `oxidized-graphite/85` label. On hover/focus it warms (border `surgical-taupe/40`, taupe fill), raises the ink penumbra, and lifts 1px. Settling under glass, not a dashed placeholder.
- **Label:** 9.5px, uppercase, tracking 0.20em.

### Arrow Buttons (gallery / Next Project)
- **Shape:** Square, no radius. 36px default, 38px large.
- **Rest:** A faint form — 1px border at 10% of the world's ink, a near-invisible tint fill, glyph at ~70% ink, 3px `backdrop-blur` lifting it off imagery.
- **Hover / Focus (emergent light):** No invert. The control surfaces — glyph brightens to full ink, the border rises in opacity (`/10` → `/40`, same hue), a soft glow rises (`--glow-bone` in the dark world, `--penumbra-ink` in the light world), and it lifts 1px (`scale 1.03, y -1`; `0.94` on tap). Theme-aware: `dark` (porcelain bloom over imagery) and `light` (ink penumbra on porcelain).

### Navigation
- **Style:** Single fixed bar, transparent, `px-6 py-7` (`md:px-[52px]`). No background, no border — it floats over whichever world is beneath it.
- **Typography:** Copperplate, 14px, uppercase, tracking 0.20–0.28em.
- **States:** Links rest at ~55–65% ink opacity and rise to full on hover/focus (300ms), catching a soft flesh underglow behind the label (`--glow-underlay`, `.nav-link::after`) — the type catches the light rather than snapping on. Color auto-flips with the panel on stage: each panel declares its world and `SectionStage` pushes it to `NavThemeProvider` by index (`data-nav-theme` remains on the section as the declarative marker). Nothing is measured — the panels are stacked, so an observer could never tell them apart.
- **Mobile:** Hamburger (two 1px rules) morphs into an X; opens a full-screen `oxidized-graphite` overlay with large centered Copperplate links (staggered entrance) and social icons at the base. Body scroll locks while open.

### Signature: The Section Dissolve
- The page does not scroll. Every full-viewport section is a panel stacked in a fixed root (`SectionStage`), and a gesture — wheel, or a finger — advances an index rather than a scroll offset. The outgoing panel's content drifts back by 15% and dissolves out; the incoming panel's clip window wipes in from the direction of travel while its content counter-slides to hold still, so the two pass *through* each other rather than one merely sliding over the other. 1.25s, `power1.inOut`. The membrane logic of the work, expressed as page transition.
- Driven by GSAP (`Observer` for input, a timeline for the motion) — the one place GSAP is used. Everything inside a panel is still Framer Motion.
- Sections that outgrow a panel (a long bio, a raised category sheet on a short phone) get a scroll region of their own (`PanelScroll`); the stage stands down for as long as that region has somewhere to go.

## 6. Do's and Don'ts

### Do:
- **Do** anchor every surface to one of the two worlds (dark `#1A1A1C` ground / `#F3EEE8` type, or light `#F3EEE8` ground / `#1A1A1C` type) and declare its `data-nav-theme`.
- **Do** let imagery lead — the specimen holds the room; type, spacing, and motion frame it.
- **Do** keep all display/label type uppercase and tracked ≥0.20em (Copperplate) and body type Cormorant weight 300.
- **Do** convey depth with tonal gradients, opacity dissolves, and the `wet-petroleum` step — atmospheric, not stacked.
- **Do** reserve `synthetic-flesh` (`#C9A48F`) for rare, body-referencing text accents and hovers only — never for a rule, tick, border or ring (see The One-Line Rule).
- **Do** hold body measure at ~60ch and keep the cinematic motion behind a `prefers-reduced-motion` crossfade fallback.

### Don't:
- **Don't** ship a **generic Squarespace/template portfolio** — a white grid of equal thumbnails with a neutral sans and no point of view.
- **Don't** apply **startup/SaaS polish**: no bright/rounded/gradient-accent styling, no hero-metric blocks, no product-landing cadence.
- **Don't** drift into **gothic/horror kitsch** — no skulls, gore, blood-drip, or Halloween darkness. The unease is clinical and refined.
- **Don't** go **busy or maximalist**: no clutter, no loud stacking, no animation for its own sake competing with the work.
- **Don't** add a *structural* drop shadow (any hard directional offset simulating a lifted panel) — that's still a bug. Control glow is the only permitted shadow, and only as soft, state-tied emergent light (see The Emergent-Light Rule).
- **Don't** use `backdrop-blur` as decoration or on surfaces — it's allowed only as a ≤3px lift of an interactive control (see The Glass-Is-For-Controls Rule). No frosted panels, no glass cards.
- **Don't** use `synthetic-flesh` as a *static* fill, background, or section device (the emergent control glow is a transient, on-attention exception); don't invent a third mid-gray ground; don't set body type above weight 300.
