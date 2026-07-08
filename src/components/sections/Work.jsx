'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { useWork } from '@/hooks/useWork'
import { categoryLanding } from '@/lib/assets'
import FitBox from '@/components/work/FitBox'
import ShimmerLine from '@/components/ui/ShimmerLine'

const EASE = [0.22, 1, 0.36, 1]

// Work section: a two-column index. Left = full-viewport-height category image
// with the category name centred over it; right = a centred, shrink-to-fit box
// holding the category toggle, description, and project links (which navigate to
// the standalone galleries).
export default function Work() {
  const { t } = useLanguage()
  const c = t.work
  const { categoryIndex, activeCategory, selectCategory, projects } = useWork(c.categories)
  const landingImage = categoryLanding[activeCategory.slug]

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
            animate={{ opacity: 0.5, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6 text-center font-descriptor text-[clamp(24px,3.4vw,50px)] uppercase leading-[1.1] tracking-[1rem] text-white [text-shadow:0_2px_18px_rgba(26,26,28,0.55)]"
          >
            {activeCategory.label}
          </motion.h2>
        </div>

        {/* Right — a fixed-size box (dynamic to the viewport). The category toggle
            is pinned to the top and "See Projects" to the bottom, so they never
            shift between categories; the description is vertically centred in the
            space between them, scaled to fit (FitBox) so its length never moves
            the pinned controls. */}
        <div className="relative h-full">
          <div className="absolute left-1/2 top-1/2 flex h-[65%] w-[65%] -translate-x-1/2 -translate-y-1/2 flex-col 2xl:h-[60%] 2xl:w-[55%]">
            {/* Category toggle — pinned top */}
            <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-1">
              {c.categories.map((cat, i) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => selectCategory(i)}
                  aria-current={i === categoryIndex}
                  className={`font-copperplate text-[12px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                    i === categoryIndex
                      ? 'text-oxidized-graphite'
                      : 'text-oxidized-graphite/40 hover:text-oxidized-graphite/70'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Description — centred in the flexible middle, scaled to fit so it
                never displaces the pinned controls (capped in the CMS to the
                Adaptive Flesh length). */}
            <FitBox className="min-h-0 w-full flex-1">
              <motion.p
                key={`desc-${activeCategory.slug}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
                className="body-copy whitespace-pre-line font-light text-oxidized-graphite/70"
              >
                {activeCategory.description}
              </motion.p>
            </FitBox>

            {/* See Projects — pinned bottom; jumps to the category's first gallery */}
            {projects[0] && (
              <motion.div
                key={`see-${activeCategory.slug}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
                className="shrink-0"
              >
                <Link href={projects[0].href} className="group inline-flex flex-col items-start gap-2">
                  <span className="inline-flex items-center gap-3 font-copperplate text-[12px] uppercase tracking-[0.18em] text-oxidized-graphite">
                    {c.seeProjects}
                    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                  <ShimmerLine tone="dark" orientation="horizontal" className="w-full" />
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
