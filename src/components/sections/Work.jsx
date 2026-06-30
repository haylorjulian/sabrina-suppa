'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { useWork } from '@/hooks/useWork'
import { useNavTheme } from '@/components/NavThemeProvider'
import { categoryLanding } from '@/lib/assets'
import FitBox from '@/components/work/FitBox'

const EASE = [0.22, 1, 0.36, 1]

// Work section: a two-column index. Left = full-viewport-height category image
// with the category name centred over it; right = a centred, shrink-to-fit box
// holding the category toggle, description, and project links (which navigate to
// the standalone galleries).
export default function Work() {
  const { t } = useLanguage()
  const c = t.work
  const { setTheme } = useNavTheme()
  const { categoryIndex, activeCategory, selectCategory, projects } = useWork(c.categories)
  const landingImage = categoryLanding[activeCategory.slug]

  // Light right band → nav text goes dark.
  useEffect(() => {
    setTheme('light')
  }, [setTheme])

  return (
    <section
      id="work"
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
            sizes="50vw"
            className="object-cover"
          />
          <motion.h2
            key={`title-${activeCategory.slug}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6 text-center font-copperplate text-[clamp(24px,3.4vw,50px)] uppercase leading-[1.1] tracking-[0.08em] text-synthetic-flesh [text-shadow:0_2px_18px_rgba(26,26,28,0.55)]"
          >
            {activeCategory.label}
          </motion.h2>
        </div>

        {/* Right — content in a centred, shrink-to-fit box (75% of the panel) */}
        <div className="relative h-full">
          <FitBox className="absolute left-1/2 top-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2">
            {/* Category toggle */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
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

            {/* Description (no label) */}
            <motion.div
              key={`desc-${activeCategory.slug}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              className="mt-10 space-y-3"
            >
              {(activeCategory.description || []).map((para, i) => (
                <p key={i} className="body-copy whitespace-pre-line font-light text-oxidized-graphite/70">
                  {para}
                </p>
              ))}
            </motion.div>

            {/* Projects */}
            <div className="mt-10">
              <p className="font-copperplate text-[11px] uppercase tracking-[0.28em] text-oxidized-graphite/80">
                {c.projectsLabel}
              </p>
              <motion.ul
                key={`projects-${activeCategory.slug}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
                className="mt-3 flex flex-col gap-1"
              >
                {projects.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={p.href}
                      className="group inline-flex items-baseline gap-2.5 border-b border-transparent pb-0.5 transition-colors duration-300 hover:border-oxidized-graphite/25"
                    >
                      <span className="font-cormorant text-[clamp(13px,1vw,15px)] font-light italic text-oxidized-graphite/55 transition-colors duration-300 group-hover:text-oxidized-graphite/80">
                        {p.title}
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-[11px] text-oxidized-graphite/35 transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </motion.ul>
            </div>
          </FitBox>
        </div>
      </div>
    </section>
  )
}
