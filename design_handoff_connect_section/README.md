# Handoff: Connect section (option 2c)

## Overview
A new **Connect** section for the sabrinasuppa.com portfolio — a fourth full-viewport section after About, holding the contact copy and the email address. No imagery, no footer strip: it is a dark-world text section that the existing global nav floats over.

## About the Design Files
`Connect-2c-reference.html` in this folder is a **design reference created in HTML** — a static prototype of the intended look, not production code to copy. Implement it in the existing Next.js App Router + Tailwind + Framer Motion codebase using the established patterns (`src/components/sections/*.jsx`, `tailwind.config.js` tokens, `src/content/*.json` + `scripts/build-content.mjs`, `SectionFade`, `ScrollStage`). Do not introduce new CSS files or new fonts.

## Fidelity
**High-fidelity.** Colors, type, spacing and states below are final and taken from the repo's own tokens. Recreate pixel-perfectly with existing components; every value below already exists in `tailwind.config.js` / `globals.css`.

## Screens / Views

### Connect (desktop, ≥1024px — the mocked viewport is 1440×900)
- **Purpose:** give the visitor the commission/collaboration enquiry email and what to include.
- **Ground:** `bg-oxidized-graphite` (`#1A1A1C`), full section, `overflow-hidden`, `min-h-[100svh] lg:h-full lg:min-h-0` — same shell as `About.jsx`. `data-nav-theme="dark"`.
- **Layout:** the content is one horizontally- and vertically-centred flex row, `align-items: stretch`, `gap: 40px`, inside `padding-inline: 52px` (matches the nav's `md:px-[52px]` gutter).
  - **Left group** — flex row, `align-items: flex-start`, `gap: 28px`:
    - `CONNECT` plate — `font-neue-haas-display`, 16px, uppercase, `tracking-[0.30em]`, `text-bone-porcelain/80`.
    - Vertical rule — 1.5px wide, `align-self: stretch` (so it runs the exact height of the copy column), track `bone-porcelain/25`, with the travelling beam. **Use `<ShimmerLine tone="light" orientation="vertical" />`** and give it a stretching height instead of a fixed `h-*` (its wrapper `<span>` is `block` + `overflow-hidden`, so `self-stretch` works).
  - **Copy column** — flex column, `width: 540px`, `gap: 30px`:
    1. Intro line — `.section-desc` (16px / 1.55 / `0.04em`), `font-light`, `text-bone-porcelain/70`. Copy: *"For custom commissions or collaborative projects, please get in touch at:"*
    2. Email — `<a href="mailto:info@sabrinasuppa.com">`, `font-ivyora-display font-thin`, **32px**, `leading-[1.1]`, `tracking-[0.08em]`, `text-bone-porcelain` (full). Rendered uppercase in the mock (`INFO@SABRINASUPPA.COM`); the client separately preferred lowercase at the hero's 37px on another option — confirm which before shipping.
    3. Notes — flex column, `gap: 14px`, same `.section-desc` / `font-light` / `bone-porcelain/70` as the intro:
       - *"When contacting me, please include a brief introduction, an outline of your enquiry, and any relevant timelines and project details."*
       - *"I am always open to considered proposals, creative exchanges, and new opportunities to work together."*
- **No footer strip** (`Footer.jsx` is not used here) and **no background image**.
- **Nav:** the existing global `Nav` renders over this section unchanged (wordmark left, links right, `px-6 py-7 md:px-[52px]`). Because there is no light column under the bar, the wordmark must read porcelain here — check the `logoColor` `lg:` inversion in `Nav.jsx` (it flips to `oxidized-graphite/75` on dark sections for About's grey column) and exempt this section, or the wordmark disappears.

### Mobile (<1024px)
Not mocked. Follow the mobile pattern of `About.jsx`: full-height graphite section, content ranged left with `px-6`, `CONNECT` plate as `font-ivyora-display` `clamp(30px,9vw,46px)` heading or the 16px plate (designer's call), copy at `.body-copy`, email at ~24–28px so it does not wrap on 375px. Ask before deviating.

## Interactions & Behavior
- **Email hover/focus:** opacity 1 → 0.72 over 350ms `cubic-bezier(.22,1,.36,1)` (`--ease-signature`). No colour change, no underline.
- **Shimmer rule:** beam travels top→bottom, 1.8s, `easeInOut`, `repeatDelay 0.3` (already in `ShimmerLine`).
- **Entrance:** reuse `staggerContainer` / `fadeInUp` from `src/lib/animations.js` — plate + rule, then intro, email, notes.
- **Section transition:** wrap in `SectionFade` like the other sections; on desktop register it with `ScrollStage` (`themes={['dark','light','dark','dark']}`, `ids={['home','work','about','connect']}`), on mobile append it after `About` in the `lg:hidden` tree with `sectionId="connect"`.
- **Reduced motion:** the shimmer and entrance must fall back to the existing crossfade path — no new motion rules.

## State Management
None. Static content, no form, no API route.

## Design Tokens (all pre-existing)
- `oxidized-graphite #1A1A1C` (ground) · `bone-porcelain #F3EEE8` (type) · rules and dimmed type via `/25`, `/70`, `/80` opacities. No `synthetic-flesh` except the nav-link underglow already in `.nav-link::after`.
- Type: `ivyora-display` weight 100 (email, wordmark), `neue-haas-grotesk-display` 300/400 (body, labels). Both from the Typekit kit in `layout.jsx`.
- Spacing used: 14 / 28 / 30 / 40 / 52px. Radius: none. Shadows: none — text-shadow is dropped because nothing sits over photography.

## Content / CMS
Add a `connect` singleton to `src/content/` (e.g. `connect.json` with `sectionLabel`, `email`, `intro`, `notes[]`) and wire it through `scripts/build-content.mjs` into `copy.generated.json`, plus a Sveltia collection entry, so the copy stays editable (see `CMS_SETUP.md`). Add the `Connect` nav link to `src/content/nav.json` — note `Hero.jsx` currently appends `hero.connect` as a mailto-only rail link; that should become the section anchor `#connect`.

## Assets
None. No new icons or images.

## Files
- `Connect-2c-reference.html` — the design reference (open in a browser at 1440×900).
- Source of the mockups in the design project: `Connect Section.dc.html`, turn 2, option `2c`.
