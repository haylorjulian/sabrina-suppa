'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { useWork } from '@/hooks/useWork'
import { categoryImages } from '@/lib/assets'
import ShimmerArrow from '@/components/ui/ShimmerArrow'

const EASE = [0.22, 1, 0.36, 1]

// Work section: a two-column index. Left = full-viewport-height category image
// with the category name centred over it; right = a centred, shrink-to-fit box
// holding the category toggle, description, and project links (which navigate to
// the standalone galleries).
export default function Work() {
  const { t } = useLanguage()
  const c = t.work
  const { categoryIndex, activeCategory, selectCategory, projects } = useWork(c.categories)
  const landingImage = categoryImages[activeCategory.slug]?.desktop

  // Editors pick the overlay text colour per category (dark for light desktop
  // images, light for dark ones) — same control as the mobile cover, applied
  // independently since the desktop and mobile images can differ.
  const dark = activeCategory.desktopOverlayTextColor === 'dark'
  const overlayText = dark ? 'text-oxidized-graphite' : 'text-white'
  const overlayShadow = dark
    ? '[text-shadow:0_2px_18px_rgba(243,238,232,0.65)]'
    : '[text-shadow:0_2px_18px_rgba(26,26,28,0.55)]'
  // Dark style (Physical Works) reads at full weight/opacity; light style keeps
  // its original thin, translucent treatment.
  const overlayWeight = dark ? 'font-light' : 'font-thin'
  const overlayOpacity = dark ? 0.7 : 0.5

  // The nav colour theme is owned solely by ScrollStage (it maps this section's
  // index → 'light'); sections must not set it themselves, or their mount effects
  // race the stage on first paint. The data-nav-theme marker below stays as the
  // declarative source of truth.
  return (
    <section
      data-nav-theme="light"
      aria-label="Work"
      className="relative h-full w-full overflow-hidden bg-bone-porcelain text-oxidized-graphite"
    >
      <div className="grid h-full grid-cols-1 lg:grid-cols-[50%_50%]">
        {/* Left — full-viewport-height category image, with the category name
            centred over it (hero name's font + size) */}
        <div className="relative hidden h-full lg:block">
          <Image
            key={activeCategory.slug}
            src={landingImage}
            alt={activeCategory.label}
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
          <motion.h2
            key={`title-${activeCategory.slug}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: overlayOpacity, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6 text-center font-ivyora-display ${overlayWeight} text-[clamp(24px,3.4vw,50px)] uppercase leading-[1.1] tracking-[1rem] ${overlayText} ${overlayShadow}`}
          >
            {activeCategory.label}
          </motion.h2>
        </div>

        {/* Right — a content-sized box, centred in the column. Width is capped at
            a fixed measure (~60ch) and height derives from the tallest category
            description, so line lengths and the toggle↔description↔button gaps
            stay as designed at every viewport size instead of inflating with it. */}
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#b7b7b7] to-[#86858b]">
          <div className="flex w-[min(60ch,75%)] flex-col">
            {/* Category toggle — pinned above the description block */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              {c.categories.map((cat, i) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => selectCategory(i)}
                  aria-current={i === categoryIndex}
                  className={`font-neue-haas-display text-[13px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                    i === categoryIndex
                      ? 'text-oxidized-graphite'
                      : 'text-oxidized-graphite/40 hover:text-oxidized-graphite/70'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Description — every category renders stacked into the same grid
                cell, so the cell always reserves the tallest description's height
                and the toggle / See Projects never move on switch; the active one
                cross-dissolves in place. Fixed type (shared with About), no
                scaling. The margins are the toggle↔description↔button rhythm —
                steady on normal screens, compressing only on short viewports. */}
            <div className="my-[clamp(2.5rem,6svh,4rem)] grid">
              {c.categories.map((cat, i) => (
                <motion.div
                  key={cat.slug}
                  initial={false}
                  animate={{ opacity: i === categoryIndex ? 1 : 0 }}
                  transition={{ duration: 0.7, ease: EASE }}
                  aria-hidden={i !== categoryIndex}
                  className={`col-start-1 row-start-1 w-full space-y-3 self-center ${
                    i === categoryIndex ? '' : 'pointer-events-none'
                  }`}
                >
                  {/* Paragraph splitting and any editor formatting (bold /
                      italic / links) are resolved at build time — see
                      scripts/build-content.mjs. */}
                  {cat.descriptionHtml.map((para, j) => (
                    <p
                      key={j}
                      className="section-desc rich-text font-light text-oxidized-graphite/70"
                      dangerouslySetInnerHTML={{ __html: para }}
                    />
                  ))}
                </motion.div>
              ))}
            </div>

            {/* See Projects — pinned below the description block; jumps to the
                category's first gallery */}
            {projects[0] && (
              <motion.div
                key={`see-${activeCategory.slug}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
              >
                <Link
                  href={projects[0].href}
                  className="group inline-flex items-center gap-3 font-neue-haas-display text-[13px] uppercase tracking-[0.18em] text-oxidized-graphite"
                >
                  {c.seeProjects}
                  <ShimmerArrow tone="dark" className="h-3 w-9 -translate-x-[5px] transition-transform duration-300 group-hover:translate-x-[-1px]" />
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
