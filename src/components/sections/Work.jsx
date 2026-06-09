'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { useWork } from '@/hooks/useWork'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useNavTheme } from '@/components/NavThemeProvider'

const EASE = [0.22, 1, 0.36, 1]

function ChevronLeft({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ChevronRight({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// One media item rendered at its natural aspect ratio (full height, width
// follows the asset) so it shows in its original, uncropped form.
function MediaItem({ item, alt }) {
  if (!item || item.type === 'placeholder') {
    return (
      <div className="flex h-full w-[60vw] items-center justify-center bg-bone-porcelain md:w-[26vw]">
        <span className="text-[10px] uppercase tracking-[0.28em] text-oxidized-graphite/40">{alt}</span>
      </div>
    )
  }
  if (item.type === 'video') {
    return <video src={item.src} autoPlay muted loop playsInline aria-hidden="true" className="block h-full w-auto" />
  }
  // Plain img so the element sizes to the asset's natural aspect ratio.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={item.src} alt={alt} className="block h-full w-auto" />
}

export default function Work() {
  const { t } = useLanguage()
  const c = t.work
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const perPage = isDesktop ? 3 : 1
  const { setTheme } = useNavTheme()

  const {
    view,
    categoryIndex,
    projectIndex,
    activeCategory,
    activeProjectCopy,
    categoryImage,
    projectCount,
    pageItems,
    totalPages,
    currentPage,
    hasPaging,
    mediaKey,
    selectCategory,
    openProjects,
    backToLanding,
    nextProject,
    prevProject,
    nextPage,
    prevPage,
  } = useWork(c.categories, perPage)

  // Keep the nav colour in sync with the active view (dark landing / light projects).
  useEffect(() => {
    setTheme(view === 'landing' ? 'dark' : 'light')
  }, [view, setTheme])

  // Touch swipe for image paging.
  const touchStartX = useRef(null)
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e) => {
    if (touchStartX.current == null || !hasPaging) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) > 40) (dx < 0 ? nextPage : prevPage)()
  }

  return (
    <section
      id="work"
      data-nav-theme={view === 'landing' ? 'dark' : 'light'}
      aria-label="Work"
      className="relative h-full w-full overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          /* ─────────────── CATEGORY LANDING ─────────────── */
          <motion.div
            key={`landing-${activeCategory.slug}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="absolute inset-0 bg-oxidized-graphite"
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
            <div className="absolute inset-0 bg-oxidized-graphite/45" />

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center overflow-y-auto px-6 pb-24 pt-[96px] text-center text-bone-porcelain">
              <motion.h2
                key={`title-${activeCategory.slug}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="text-[clamp(26px,3.6vw,52px)] font-light uppercase tracking-[0.18em] [text-shadow:0_1px_12px_rgba(26,26,28,0.6)]"
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
                    className="whitespace-pre-line text-[clamp(12px,1vw,15px)] font-light leading-[1.7] text-bone-porcelain/85 [text-shadow:0_1px_10px_rgba(26,26,28,0.7)]"
                  >
                    {para}
                  </p>
                ))}
              </motion.div>

              <motion.button
                type="button"
                onClick={openProjects}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-10 border border-bone-porcelain/60 px-9 py-3 text-[11px] uppercase tracking-[0.3em] text-bone-porcelain transition-colors duration-300 hover:bg-bone-porcelain hover:text-oxidized-graphite"
              >
                {c.seeProjects}
              </motion.button>
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
                  className={`text-[11px] uppercase tracking-[0.24em] transition-colors duration-300 [text-shadow:0_1px_8px_rgba(26,26,28,0.7)] ${
                    i === categoryIndex ? 'text-bone-porcelain' : 'text-bone-porcelain/45 hover:text-bone-porcelain/75'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </nav>
          </motion.div>
        ) : (
          /* ─────────────── PROJECTS SUBPAGE ─────────────── */
          <motion.div
            key="projects"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="absolute inset-0 flex flex-col bg-bone-porcelain"
          >
            {/* Back button — top-left */}
            <button
              type="button"
              onClick={backToLanding}
              className="absolute left-6 top-[88px] z-20 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-oxidized-graphite/60 transition-colors duration-300 hover:text-oxidized-graphite md:left-[52px]"
            >
              <ChevronLeft className="h-4 w-4" />
              {c.back}
            </button>

            {/* Header: category name (main) + project name (with arrows) + description */}
            <div className="mx-auto w-full max-w-3xl px-6 pt-[84px] text-center">
              <h2 className="text-[clamp(24px,3vw,44px)] font-light uppercase tracking-[0.16em] text-oxidized-graphite">
                {activeCategory.label}
              </h2>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`meta-${projectIndex}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <div className="mt-4 flex items-center justify-center gap-5">
                    {projectCount > 1 && (
                      <button
                        type="button"
                        onClick={prevProject}
                        aria-label="Previous project"
                        className="text-oxidized-graphite/50 transition-colors hover:text-oxidized-graphite"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    )}
                    <h3 className="text-[clamp(15px,1.5vw,21px)] font-extralight italic tracking-[0.04em] text-oxidized-graphite/85">
                      {activeProjectCopy.title}
                    </h3>
                    {projectCount > 1 && (
                      <button
                        type="button"
                        onClick={nextProject}
                        aria-label="Next project"
                        className="text-oxidized-graphite/50 transition-colors hover:text-oxidized-graphite"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {activeProjectCopy.description && (
                    <p className="mx-auto mt-4 max-w-xl text-[12.5px] font-light leading-[1.65] text-oxidized-graphite/70">
                      {activeProjectCopy.description}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Image pager */}
              {hasPaging && (
                <div className="mt-5 flex items-center justify-center gap-4 text-oxidized-graphite/60">
                  <button type="button" onClick={prevPage} aria-label={c.prevImageLabel} className="transition-colors hover:text-oxidized-graphite">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-[11px] tracking-[0.18em] tabular-nums">
                    {currentPage} / {totalPages}
                  </span>
                  <button type="button" onClick={nextPage} aria-label={c.nextImageLabel} className="transition-colors hover:text-oxidized-graphite">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Image row — images at original aspect, no gaps, flush to the bottom */}
            <div
              className="mt-8 flex min-h-0 w-full flex-1 items-end justify-center"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mediaKey}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="flex h-full items-end justify-center"
                >
                  {pageItems.map((item, i) => (
                    <div key={`${mediaKey}-${i}`} className="relative h-full shrink-0">
                      <MediaItem item={item} alt={`${activeProjectCopy.title} — image`} />
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
