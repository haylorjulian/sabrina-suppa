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
    goToPage,
  } = useWorkGallery(c.categories, perPage)

  const activeCategory = c.categories[categoryIndex]
  const totalPages = Math.max(1, Math.ceil(imageCount / perPage))
  const currentPage = Math.floor(pageStart / perPage) + 1

  // Next Project CTA — placed top-right on mobile (aligned with the title) and
  // bottom-right (aligned with the pills) on desktop.
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

  return (
    <section
      id="work"
      ref={ref}
      data-nav-theme="light"
      aria-label="Work"
      className="relative flex h-full w-full flex-col overflow-hidden bg-bone-porcelain"
    >
      {/* ── Header: category label, project title, then the category description ── */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="px-4 pt-[84px] md:px-[52px] md:pt-[104px]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-[9px] uppercase tracking-[0.28em] text-synthetic-flesh">
              {activeCategory.label}
            </p>
            <h2 className="text-[clamp(18px,2.2vw,32px)] font-extralight italic leading-[1.1] tracking-[0.06em] text-oxidized-graphite">
              {activeProjectCopy.title}
            </h2>
          </div>
          {/* Mobile-only: aligned with the project name */}
          <NextProject className="mt-1 md:hidden" />
        </div>

        {activeCategory.description && (
          <div className="mt-3 max-w-2xl space-y-2">
            {activeCategory.description.map((para, i) => (
              <p
                key={i}
                className="text-[clamp(10px,0.8vw,12px)] font-light leading-[1.55] text-oxidized-graphite/70"
              >
                {para}
              </p>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Image area — pushed below the header, sits just above the controls ── */}
      <div className="relative flex min-h-0 flex-1 items-end justify-center px-4 pb-2 md:items-center md:px-24 md:pb-4">
        {/* Desktop: up/down arrows with the page count between them */}
        {hasPaging && (
          <div className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
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
            className="flex h-full w-full items-center justify-center gap-6 md:gap-8"
          >
            {pageItems.map((item, i) => (
              <div
                key={`${mediaKey}-${i}`}
                className="relative h-full max-h-[58svh] w-full max-w-[560px] flex-1 md:max-h-[62svh]"
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

      {/* ── Mobile carousel dots ── */}
      {hasPaging && (
        <div className="flex justify-center gap-2 pb-3 md:hidden">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToPage(i)}
              aria-label={`${c.goToImageLabel} ${i + 1}`}
              aria-current={i === currentPage - 1}
              className={`h-2 w-2 rounded-full border border-oxidized-graphite transition-all duration-300 ${
                i === currentPage - 1 ? 'bg-oxidized-graphite' : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Footer: pill nav (+ desktop Next Project aligned with it) ── */}
      <div className="relative flex items-center justify-center px-4 pb-9 md:px-[52px]">
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
