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

// One media item, cover-cropped to fill its column (full-bleed gallery look).
function MediaItem({ item, alt }) {
  if (!item || item.type === 'placeholder') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-bone-porcelain">
        <span className="text-[10px] uppercase tracking-[0.28em] text-oxidized-graphite/40">{alt}</span>
      </div>
    )
  }
  if (item.type === 'video') {
    return <video src={item.src} autoPlay muted loop playsInline aria-hidden="true" className="h-full w-full object-cover" />
  }
  return <Image src={item.src} alt={alt} fill unoptimized sizes="(min-width: 1024px) 34vw, 100vw" className="object-cover" />
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
    selectProject,
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
            {/* Top bar: back + category name */}
            <div className="relative flex items-center px-6 pt-[88px] md:px-[52px]">
              <button
                type="button"
                onClick={backToLanding}
                className="group flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-oxidized-graphite/60 transition-colors duration-300 hover:text-oxidized-graphite"
              >
                <ChevronLeft className="h-4 w-4" />
                {c.back}
              </button>
              <span className="absolute left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.3em] text-synthetic-flesh">
                {activeCategory.label}
              </span>
            </div>

            {/* Project name + small description */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`meta-${projectIndex}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="mx-auto mt-6 max-w-2xl px-6 text-center"
              >
                <h3 className="text-[clamp(20px,2.4vw,32px)] font-extralight italic tracking-[0.04em] text-oxidized-graphite">
                  {activeProjectCopy.title}
                </h3>
                {activeProjectCopy.description && (
                  <p className="mx-auto mt-3 max-w-xl text-[13px] font-light leading-[1.6] text-oxidized-graphite/70">
                    {activeProjectCopy.description}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Image row — full-bleed, 3 across on desktop / 1 on mobile */}
            <div
              className="relative mt-6 flex min-h-0 flex-1 items-center"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {hasPaging && (
                <button
                  type="button"
                  onClick={prevPage}
                  aria-label={c.prevImageLabel}
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 text-oxidized-graphite/70 transition-colors hover:text-oxidized-graphite md:left-4"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={mediaKey}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="flex h-[56svh] w-full items-stretch gap-2 px-2 md:gap-3 md:px-3"
                >
                  {pageItems.map((item, i) => (
                    <div key={`${mediaKey}-${i}`} className="relative h-full flex-1 overflow-hidden">
                      <MediaItem item={item} alt={`${activeProjectCopy.title} — image`} />
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {hasPaging && (
                <button
                  type="button"
                  onClick={nextPage}
                  aria-label={c.nextImageLabel}
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 text-oxidized-graphite/70 transition-colors hover:text-oxidized-graphite md:right-4"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              )}
            </div>

            {/* Bottom: page indicator + project switcher */}
            <div className="flex flex-col items-center gap-4 px-4 pb-9 pt-5 md:px-[52px]">
              {hasPaging && (
                <span className="text-[11px] tracking-[0.18em] text-oxidized-graphite/60 tabular-nums">
                  {currentPage} / {totalPages}
                </span>
              )}
              {projectCount > 1 && (
                <nav aria-label="Projects" className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
                  {activeCategory.projects.map((proj, i) => (
                    <button
                      key={proj.title}
                      type="button"
                      onClick={() => selectProject(i)}
                      aria-current={i === projectIndex}
                      className={`whitespace-nowrap text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                        i === projectIndex
                          ? 'text-oxidized-graphite'
                          : 'text-oxidized-graphite/40 hover:text-oxidized-graphite/70'
                      }`}
                    >
                      {proj.title}
                    </button>
                  ))}
                </nav>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
