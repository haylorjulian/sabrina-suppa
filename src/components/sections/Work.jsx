'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { useWorkGallery } from '@/hooks/useWorkGallery'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { fadeInUp, crossfade } from '@/lib/animations'
import ArrowButton from '@/components/ui/ArrowButton'
import Pill from '@/components/ui/Pill'

// Renders a single media item at its natural aspect ratio (object-contain, never
// cropped) and unoptimized so the original resolution is served.
function MediaItem({ item, alt }) {
  if (!item || item.type === 'placeholder') {
    return (
      <div className="flex h-full w-full items-center justify-center border border-dashed border-oxidized-graphite/20">
        <span className="text-[10px] uppercase tracking-[0.28em] text-oxidized-graphite/40">
          {alt}
        </span>
      </div>
    )
  }
  if (item.type === 'video') {
    return (
      <video
        src={item.src}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="h-full w-full object-contain"
      />
    )
  }
  return (
    <Image
      src={item.src}
      alt={alt}
      fill
      unoptimized
      sizes="(min-width: 768px) 40vw, 92vw"
      className="object-contain"
    />
  )
}

export default function Work() {
  const { t } = useLanguage()
  const c = t.work
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const perPage = isDesktop ? 2 : 1

  const {
    categoryIndex,
    pageStart,
    imageCount,
    projectCount,
    pageItems,
    hasPaging,
    activeProjectCopy,
    mediaKey,
    selectCategory,
    nextProject,
    nextImage,
    prevImage,
  } = useWorkGallery(c.categories, perPage)

  const activeCategory = c.categories[categoryIndex]
  const totalPages = Math.max(1, Math.ceil(imageCount / perPage))
  const currentPage = Math.floor(pageStart / perPage) + 1

  // Next Project CTA — top-right (aligned with the title) on mobile, bottom-right
  // (aligned with the pills) on desktop.
  function NextProject({ className }) {
    if (projectCount <= 1) return null
    return (
      <button
        type="button"
        onClick={nextProject}
        className={`group flex items-center gap-[14px] ${className}`}
      >
        <span className="whitespace-nowrap text-[10px] uppercase tracking-[0.26em] text-oxidized-graphite">
          {c.nextProject}
        </span>
        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center border border-oxidized-graphite text-sm text-oxidized-graphite transition-colors duration-200 group-hover:bg-oxidized-graphite group-hover:text-bone-porcelain">
          <span aria-hidden="true">→</span>
        </span>
      </button>
    )
  }

  // Category description, broken into parts that advance as you page through the
  // images. Shows the part for the current page (wrapping if there are more
  // pages than parts).
  function Desc({ className }) {
    const parts = activeCategory.description
    if (!parts || !parts.length) return null
    const part = parts[(currentPage - 1) % parts.length]
    return (
      <div className={className}>
        <AnimatePresence mode="wait">
          <motion.p
            key={`${categoryIndex}-${currentPage}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-[15px] font-light leading-[1.7] text-oxidized-graphite/80 md:text-[clamp(13px,1.2vw,18px)] md:leading-[1.6]"
          >
            {part}
          </motion.p>
        </AnimatePresence>
      </div>
    )
  }

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
      {/* ── Header: project name (top-left, replacing the SS logo on desktop),
           with the active description part underneath ── */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="relative z-20 px-4 pt-[84px] md:absolute md:inset-x-0 md:top-0 md:px-[52px] md:pt-[26px]"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[clamp(18px,2.2vw,32px)] font-extralight italic leading-[1.1] tracking-[0.06em] text-surgical-taupe">
            {activeProjectCopy.title}
          </h2>
          {/* Mobile: Next Project aligned with the project name */}
          <NextProject className="md:hidden" />
        </div>
        {/* Category description — underneath the project name */}
        <Desc className="mt-3 max-w-xl md:mt-4 md:max-w-2xl" />
      </motion.div>

      {/* ── Images — flow on mobile (sits low, below the header), centred on the
           screen on desktop ── */}
      <div
        className="relative flex min-h-0 flex-1 items-end justify-center px-4 pb-2 md:absolute md:inset-0 md:items-center md:px-24 md:pb-0"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Desktop: up/down arrows with the page count between them */}
        {hasPaging && (
          <div className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
            <ArrowButton glyph="↑" onClick={prevImage} label={c.prevImageLabel} />
            <span className="text-[11px] tracking-[0.18em] text-oxidized-graphite tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <ArrowButton glyph="↓" onClick={nextImage} label={c.nextImageLabel} />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={mediaKey}
            variants={crossfade}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex h-full max-h-[52svh] w-full items-center justify-center gap-6 md:max-h-[64svh] md:gap-8"
          >
            {pageItems.map((item, i) => (
              <div
                key={`${mediaKey}-${i}`}
                className="relative h-full w-full max-w-[560px] flex-1"
              >
                <MediaItem
                  item={item}
                  alt={
                    item?.type === 'placeholder'
                      ? activeProjectCopy.comingSoon
                      : `${activeProjectCopy.title} — ${pageStart + i + 1}`
                  }
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Mobile: arrows underneath the image, horizontally centred ── */}
      {hasPaging && (
        <div className="flex items-center justify-center gap-5 pb-3 md:hidden">
          <ArrowButton glyph="←" onClick={prevImage} label={c.prevImageLabel} />
          <ArrowButton glyph="→" onClick={nextImage} label={c.nextImageLabel} />
        </div>
      )}

      {/* ── Footer: pill nav (+ desktop Next Project aligned with it) ── */}
      <div className="relative z-20 flex items-center justify-center px-4 pb-9 md:absolute md:inset-x-0 md:bottom-0 md:px-[52px]">
        <nav
          aria-label="Work categories"
          className="flex max-w-[92vw] items-center gap-1.5 overflow-x-auto"
        >
          {c.categories.map((cat, i) => (
            <Pill
              key={cat.slug}
              label={cat.label}
              active={i === categoryIndex}
              onClick={() => selectCategory(i)}
            />
          ))}
        </nav>
        <NextProject className="absolute right-[52px] hidden md:flex" />
      </div>
    </section>
  )
}
