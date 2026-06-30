'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { useWork } from '@/hooks/useWork'
import { useNavTheme } from '@/components/NavThemeProvider'
import { categoryImages } from '@/lib/assets'

const EASE = [0.22, 1, 0.36, 1]

// Work section: a cinematic dark index. Each category shows its concept text and
// a list of projects; selecting a project navigates to its standalone gallery
// page (/work/[category]/[project]).
export default function Work() {
  const { t } = useLanguage()
  const c = t.work
  const { setTheme } = useNavTheme()
  const { categoryIndex, activeCategory, selectCategory, projects } = useWork(c.categories)
  const categoryImage = categoryImages[activeCategory.slug] || {}

  // This section is always dark now (the light projects view has moved out).
  useEffect(() => {
    setTheme('dark')
  }, [setTheme])

  return (
    <section
      id="work"
      data-nav-theme="dark"
      aria-label="Work"
      className="relative h-full w-full overflow-hidden bg-oxidized-graphite"
    >
      {/* Background image — landscape on desktop, vertical on mobile */}
      <Image
        src={categoryImage.landscape}
        alt={activeCategory.label}
        fill
        priority
        sizes="100vw"
        className="hidden object-cover lg:block"
      />
      <Image
        src={categoryImage.vertical}
        alt={activeCategory.label}
        fill
        priority
        sizes="100vw"
        className="object-cover lg:hidden"
      />
      <div className="absolute inset-0 bg-oxidized-graphite/55" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center overflow-y-auto px-6 pb-28 pt-[96px] text-center text-bone-porcelain">
        <motion.h2
          key={`title-${activeCategory.slug}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="font-copperplate text-[clamp(26px,3.6vw,52px)] uppercase tracking-[0.18em] [text-shadow:0_1px_12px_rgba(26,26,28,0.6)]"
        >
          {activeCategory.label}
        </motion.h2>

        <motion.div
          key={`desc-${activeCategory.slug}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          className="mt-7 max-w-2xl space-y-3"
        >
          {(activeCategory.description || []).map((para, i) => (
            <p
              key={i}
              className="body-copy-lg whitespace-pre-line font-light text-bone-porcelain/85 [text-shadow:0_1px_10px_rgba(26,26,28,0.7)]"
            >
              {para}
            </p>
          ))}
        </motion.div>

        {/* Project links — navigate to standalone galleries */}
        <motion.ul
          key={`projects-${activeCategory.slug}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          className="mt-10 flex flex-col items-center gap-2.5"
        >
          {projects.map((p) => (
            <li key={p.slug}>
              <Link
                href={p.href}
                className="group inline-flex items-baseline gap-3 border-b border-transparent pb-1 transition-colors duration-300 hover:border-bone-porcelain/40"
              >
                <span className="font-cormorant text-[clamp(18px,2vw,26px)] font-light italic text-bone-porcelain">
                  {p.title}
                </span>
                <span
                  aria-hidden="true"
                  className="text-[12px] text-bone-porcelain/45 transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </motion.ul>
      </div>

      {/* Category toggle — bottom centre */}
      <nav
        aria-label="Categories"
        className="absolute inset-x-0 bottom-10 z-10 flex items-center justify-center gap-7"
      >
        {c.categories.map((cat, i) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => selectCategory(i)}
            aria-current={i === categoryIndex}
            className={`font-copperplate text-[12px] uppercase tracking-[0.22em] transition-colors duration-300 [text-shadow:0_1px_8px_rgba(26,26,28,0.7)] ${
              i === categoryIndex ? 'text-bone-porcelain' : 'text-bone-porcelain/45 hover:text-bone-porcelain/75'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </nav>
    </section>
  )
}
