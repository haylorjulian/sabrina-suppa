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
      sizes="(min-width: 768px) 40vw, 80vw"
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
  } = useWorkGallery(c.categories, isDesktop ? 2 : 1)

  const counter =
    pageItems.length > 1
      ? `${pageStart + 1}–${pageStart + pageItems.length} ${c.imageOf} ${imageCount}`
      : `${pageStart + 1} ${c.imageOf} ${imageCount}`

  return (
    <section
      id="work"
      ref={ref}
      data-nav-theme="light"
      aria-label="Work"
      className="relative h-full w-full overflow-hidden bg-bone-porcelain"
    >
      {/* ── Centred media frame — images keep their natural dimensions, up to
           two side-by-side on desktop. Crossfades on category/project/page change. ── */}
      <div className="absolute inset-0 flex items-center justify-center px-16 pb-24 pt-24 md:px-24">
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
                className="relative h-full max-h-[62svh] w-full max-w-[560px] flex-1"
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

      {/* ── Project meta — top-left, below nav ── */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="absolute left-6 top-[88px] z-10 md:left-[52px]"
      >
        <p className="mb-2 text-[9px] uppercase tracking-[0.28em] text-synthetic-flesh">
          {c.categories[categoryIndex].label}
        </p>
        <h2 className="text-[clamp(18px,2.2vw,32px)] font-extralight italic leading-[1.1] tracking-[0.06em] text-oxidized-graphite">
          {activeProjectCopy.title}
        </h2>
      </motion.div>

      {/* ── Left arrows — page through images within a project ── */}
      {hasPaging && (
        <div className="absolute left-6 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3">
          <ArrowButton glyph="↑" onClick={prevImage} label={c.prevImageLabel} />
          <ArrowButton glyph="↓" onClick={nextImage} label={c.nextImageLabel} />
        </div>
      )}

      {/* ── Image counter ── */}
      {imageCount > 1 && (
        <div className="absolute bottom-[120px] left-6 z-10 text-[10px] tracking-[0.18em] text-oxidized-graphite">
          {counter}
        </div>
      )}

      {/* ── Next Project CTA — bottom-right, boxed arrow ── */}
      {projectCount > 1 && (
        <button
          type="button"
          onClick={nextProject}
          className="group absolute bottom-[108px] right-8 z-10 flex items-center gap-[14px] md:right-[90px]"
        >
          <span className="text-[10px] uppercase tracking-[0.26em] text-oxidized-graphite">
            {c.nextProject}
          </span>
          <span className="flex h-[38px] w-[38px] items-center justify-center border border-oxidized-graphite text-sm text-oxidized-graphite transition-colors duration-200 group-hover:bg-oxidized-graphite group-hover:text-bone-porcelain">
            <span aria-hidden="true">→</span>
          </span>
        </button>
      )}

      {/* ── Bottom pill nav — category tabs ── */}
      <nav
        aria-label="Work categories"
        className="absolute bottom-9 left-1/2 z-20 flex max-w-[92vw] -translate-x-1/2 items-center gap-1.5 overflow-x-auto"
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
    </section>
  )
}
