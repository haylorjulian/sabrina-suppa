'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { useWorkGallery } from '@/hooks/useWorkGallery'
import { fadeInUp, crossfade } from '@/lib/animations'
import ArrowButton from '@/components/ui/ArrowButton'
import Pill from '@/components/ui/Pill'

export default function Work() {
  const { t } = useLanguage()
  const c = t.work
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })

  const {
    categoryIndex,
    imageIndex,
    imageCount,
    projectCount,
    activeMedia,
    activeProjectCopy,
    mediaKey,
    selectCategory,
    nextProject,
    nextImage,
    prevImage,
  } = useWorkGallery(c.categories)

  const isPlaceholder = !activeMedia || activeMedia.type === 'placeholder'
  const isVideo = activeMedia?.type === 'video'

  return (
    <section
      id="work"
      ref={ref}
      data-nav-theme="light"
      aria-label="Work"
      className="relative h-screen min-h-[600px] w-full overflow-hidden bg-bone-porcelain"
    >
      {/* ── Full-screen media (crossfades on category/project/image change) ── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={mediaKey}
          variants={crossfade}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0"
        >
          {isPlaceholder ? (
            <div className="flex h-full w-full items-center justify-center bg-bone-porcelain">
              <span className="text-[10px] uppercase tracking-[0.28em] text-oxidized-graphite/40">
                {activeProjectCopy.comingSoon}
              </span>
            </div>
          ) : isVideo ? (
            <video
              src={activeMedia.src}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              src={activeMedia.src}
              alt={activeProjectCopy.title}
              fill
              sizes="100vw"
              className="object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Cream vignette so overlays read cleanly */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bone-porcelain/20 via-transparent to-bone-porcelain/55" />

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

      {/* ── Left arrows — navigate images within a project ── */}
      {imageCount > 1 && (
        <div className="absolute left-6 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3">
          <ArrowButton glyph="↑" onClick={prevImage} label={c.prevImageLabel} />
          <ArrowButton glyph="↓" onClick={nextImage} label={c.nextImageLabel} />
        </div>
      )}

      {/* ── Image counter ── */}
      {imageCount > 1 && (
        <div className="absolute bottom-[120px] left-6 z-10 text-[10px] tracking-[0.18em] text-oxidized-graphite">
          {imageIndex + 1} {c.imageOf} {imageCount}
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
