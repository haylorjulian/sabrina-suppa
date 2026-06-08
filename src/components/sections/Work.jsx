'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { useWorkGallery } from '@/hooks/useWorkGallery'
import { staggerContainer, fadeInUp, crossfade } from '@/lib/animations'
import ShimmerLine from '@/components/ui/ShimmerLine'

// Approx. fixed-nav height — the Work content is offset by this so it never sits
// under the navigation items.
const NAV_OFFSET = 'pt-[88px]'

// One media item at its natural aspect ratio (object-contain, never cropped),
// unoptimized so the original resolution is served.
function MediaItem({ item, alt }) {
  if (!item || item.type === 'placeholder') {
    return (
      <div className="flex h-full w-full items-center justify-center border border-dashed border-oxidized-graphite/20">
        <span className="text-[10px] uppercase tracking-[0.28em] text-oxidized-graphite/40">{alt}</span>
      </div>
    )
  }
  if (item.type === 'video') {
    return (
      <video src={item.src} autoPlay muted loop playsInline aria-hidden="true" className="h-full w-full object-contain" />
    )
  }
  return <Image src={item.src} alt={alt} fill unoptimized sizes="(min-width: 768px) 55vw, 92vw" className="object-contain" />
}

function ChevronLeft({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ChevronRight({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Work() {
  const { t } = useLanguage()
  const c = t.work
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })

  const {
    categoryIndex,
    imageIndex,
    projectCount,
    imageCount,
    hasPaging,
    isFirstImage,
    activeCategory,
    activeProjectCopy,
    activeMedia,
    mediaKey,
    selectCategory,
    nextProject,
    nextImage,
    prevImage,
  } = useWorkGallery(c.categories)

  // Touch swipe (mobile) — left/right to page through images.
  const touchStartX = useRef(null)
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e) => {
    if (touchStartX.current == null || !hasPaging) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) > 40) (dx < 0 ? nextImage : prevImage)()
  }

  return (
    <section
      id="work"
      ref={ref}
      data-nav-theme="light"
      aria-label="Work"
      className="relative flex h-full w-full flex-col overflow-hidden bg-bone-porcelain"
    >
      {/* Main content — offset below the nav; scrolls on mobile, two columns centred on desktop */}
      <div className={`flex min-h-0 flex-1 flex-col overflow-y-auto ${NAV_OFFSET} md:flex-row md:items-center md:overflow-visible`}>
        {/* LEFT — category name + full description, vertically centred */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex shrink-0 flex-col justify-center px-6 md:w-[44%] md:px-[52px]"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-[clamp(22px,2.6vw,38px)] font-extralight italic leading-[1.1] tracking-[0.06em] text-surgical-taupe"
          >
            {activeCategory.label}
          </motion.h2>
          <motion.div variants={fadeInUp} className="mt-5 space-y-3 md:mt-6">
            {(activeCategory.description || []).map((para, i) => (
              <p
                key={i}
                className="text-[14px] font-light leading-[1.65] text-oxidized-graphite/80 md:text-[clamp(13px,1vw,16px)]"
              >
                {para}
              </p>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT — one image, ~80vh, with shimmer-line arrows inside it */}
        <div
          className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-6 md:px-12 md:py-0"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {activeProjectCopy.title && (
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-oxidized-graphite/70">
              {activeProjectCopy.title}
            </p>
          )}
          <div className="relative h-[38svh] w-full md:h-[72svh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={mediaKey}
                variants={crossfade}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0"
              >
                <MediaItem
                  item={activeMedia}
                  alt={
                    activeMedia?.type === 'placeholder'
                      ? activeProjectCopy.comingSoon
                      : `${activeProjectCopy.title} — ${imageIndex + 1}`
                  }
                />
              </motion.div>
            </AnimatePresence>

            {/* Horizontal shimmer-line arrows, grouped and overlapping the image
                (first image shows only the forward arrow) */}
            {hasPaging && (
              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-8 text-oxidized-graphite">
                {!isFirstImage && (
                  <button
                    type="button"
                    onClick={prevImage}
                    aria-label={c.prevImageLabel}
                    className="flex items-center gap-2 py-2"
                  >
                    <ChevronLeft />
                    <ShimmerLine tone="dark" orientation="horizontal" thick className="w-10 md:w-14" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={nextImage}
                  aria-label={c.nextImageLabel}
                  className="flex items-center gap-2 py-2"
                >
                  <ShimmerLine tone="dark" orientation="horizontal" thick className="w-10 md:w-14" />
                  <ChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM — category nav (centre) + Next Project (bottom-right on desktop) */}
      <div className="relative flex flex-col items-center gap-4 px-4 pb-9 md:px-[52px]">
        <nav aria-label="Work categories" className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {c.categories.map((cat, i) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => selectCategory(i)}
              aria-current={i === categoryIndex}
              className={`whitespace-nowrap text-[11px] uppercase tracking-[0.22em] transition-colors duration-300 ${
                i === categoryIndex
                  ? 'text-oxidized-graphite'
                  : 'text-oxidized-graphite/40 hover:text-oxidized-graphite/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </nav>

        {projectCount > 1 && (
          <button
            type="button"
            onClick={nextProject}
            className="group flex items-center gap-[14px] md:absolute md:bottom-9 md:right-[52px]"
          >
            <span className="whitespace-nowrap text-[10px] uppercase tracking-[0.26em] text-oxidized-graphite">
              {c.nextProject}
            </span>
            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center border border-oxidized-graphite text-sm text-oxidized-graphite transition-colors duration-200 group-hover:bg-oxidized-graphite group-hover:text-bone-porcelain">
              <span aria-hidden="true">→</span>
            </span>
          </button>
        )}
      </div>
    </section>
  )
}
