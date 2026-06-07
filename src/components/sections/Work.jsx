'use client'

import { useRef, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { useWorkGallery } from '@/hooks/useWorkGallery'
import { workMedia } from '@/lib/assets'
import { staggerContainer, fadeInUp, crossfade } from '@/lib/animations'
import ArrowButton from '@/components/ui/ArrowButton'

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

export default function Work() {
  const { t } = useLanguage()
  const c = t.work
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })

  // Flatten categories → a single ordered list of projects, each carrying its
  // category label + full description + media.
  const projects = useMemo(() => {
    const list = []
    c.categories.forEach((cat) => {
      ;(cat.projects || []).forEach((proj, pi) => {
        list.push({
          name: proj.title,
          comingSoon: proj.comingSoon,
          categoryLabel: cat.label,
          description: cat.description || [],
          media: workMedia[cat.slug]?.[pi]?.media || [],
        })
      })
    })
    return list
  }, [c])

  const {
    projectIndex,
    imageIndex,
    imageCount,
    hasPaging,
    isFirstImage,
    activeProject,
    activeMedia,
    mediaKey,
    selectProject,
    nextImage,
    prevImage,
  } = useWorkGallery(projects)

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
      {/* Main content — scrolls on mobile if long; two columns centred on desktop */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:items-center md:overflow-visible">
        {/* LEFT — category name + full description, vertically centred */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex shrink-0 flex-col justify-center px-6 pt-[84px] md:w-[44%] md:px-[52px] md:pt-0"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-[clamp(22px,2.6vw,38px)] font-extralight italic leading-[1.1] tracking-[0.06em] text-surgical-taupe"
          >
            {activeProject.categoryLabel}
          </motion.h2>
          <motion.div variants={fadeInUp} className="mt-5 space-y-3 md:mt-6">
            {activeProject.description.map((para, i) => (
              <p
                key={i}
                className="text-[14px] font-light leading-[1.65] text-oxidized-graphite/80 md:text-[clamp(13px,1vw,16px)]"
              >
                {para}
              </p>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT — one image, ~80vh */}
        <div
          className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-6 md:px-12 md:py-0"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative h-[42svh] w-full md:h-[80svh]">
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
                      ? activeProject.comingSoon
                      : `${activeProject.name} — ${imageIndex + 1}`
                  }
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Image nav — first image shows only the forward arrow */}
          {hasPaging && (
            <div className="mt-4 flex items-center gap-4">
              {!isFirstImage && <ArrowButton glyph="←" onClick={prevImage} label={c.prevImageLabel} />}
              <span className="text-[11px] tracking-[0.18em] text-oxidized-graphite tabular-nums">
                {imageIndex + 1} / {imageCount}
              </span>
              <ArrowButton glyph="→" onClick={nextImage} label={c.nextImageLabel} />
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM — project names as plain-text nav */}
      <nav
        aria-label="Projects"
        className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 px-4 pb-9 pt-2 md:px-[52px]"
      >
        {projects.map((proj, i) => (
          <button
            key={proj.name}
            type="button"
            onClick={() => selectProject(i)}
            aria-current={i === projectIndex}
            className={`whitespace-nowrap text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 ${
              i === projectIndex
                ? 'text-oxidized-graphite'
                : 'text-oxidized-graphite/40 hover:text-oxidized-graphite/70'
            }`}
          >
            {proj.name}
          </button>
        ))}
      </nav>
    </section>
  )
}
