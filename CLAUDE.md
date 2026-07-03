# Design Context

This project has committed design context. **Read these before any UI/design work:**

- **[PRODUCT.md](PRODUCT.md)** — strategic (register, users, purpose, brand personality, anti-references, principles). Register: **brand** (single-artist portfolio; the design *is* the product).
- **[DESIGN.md](DESIGN.md)** — visual system (tokens in YAML frontmatter are normative; prose gives context). Also `.impeccable/design.json` sidecar (tonal ramps, motion, component snippets).

## The one-line brief

Portfolio for **Sabrina Suppa — "Body Architect"**, whose practice explores *adaptive morphologies* (engineered structures that reshape the human silhouette). Target feeling: **unsettled / visceral**, achieved by clinical precision and low light — never shock.

## Non-negotiables (see DESIGN.md for the full rules)

- **Two worlds only.** Every surface is dark-world (`#1A1A1C` ground / `#F3EEE8` type) or light-world (`#F3EEE8` ground / `#1A1A1C` type); declare `data-nav-theme`. No third mid-gray ground.
- **No drop shadows, ever.** Depth = tonal gradients, opacity dissolves, `wet-petroleum` step, functional `text-shadow` only.
- **`synthetic-flesh` (`#C9A48F`) is the one rare accent** — never a fill, background, or section device.
- **Type:** Copperplate/Futura labels are uppercase, tracked ≥0.20em; Cormorant body stays weight 300.
- **Avoid:** template Squarespace portfolios, SaaS polish, gothic/horror kitsch, busy maximalism.
