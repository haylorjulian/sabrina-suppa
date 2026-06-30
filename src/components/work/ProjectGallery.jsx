'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp, lineReveal } from '@/lib/animations'
import GalleryMedia from './GalleryMedia'
import ProjectHeader from './ProjectHeader'

// Height presets for single rows. Literal class strings so Tailwind picks them up.
const SIZE = {
  feature: 'max-h-[90vh]',
  mid: 'max-h-[78vh]',
  small: 'max-h-[58vh]',
}

// Deterministic layout planner. The media set is portrait-heavy, so rhythm comes
// from varying scale, horizontal offset, and the occasional side-by-side diptych
// rather than from full-bleed landscape moments. Keyed off the index so the
// composition is authored and stable, never random.
function planRows(items) {
  const rows = []
  let i = 0
  let n = 0
  while (i < items.length) {
    const remaining = items.length - i
    const mod = n % 5
    if (mod === 2 && remaining >= 2) {
      rows.push({ type: 'pair', items: [items[i], items[i + 1]], start: i })
      i += 2
    } else {
      let size = 'mid'
      let align = 'center'
      if (mod === 0) size = 'feature'
      else if (mod === 3) align = i % 2 ? 'end' : 'start'
      else if (mod === 4) size = 'small'
      rows.push({ type: 'single', item: items[i], size, align, index: i })
      i += 1
    }
    n++
  }
  return rows
}

export default function ProjectGallery({ categoryLabel, project, media, prev, next }) {
  // The home route snaps each section to the viewport (html { scroll-snap-type:
  // y mandatory }). A long gallery must scroll freely — neutralise snap here and
  // restore it on unmount.
  useEffect(() => {
    const html = document.documentElement
    const prevSnap = html.style.scrollSnapType
    html.style.scrollSnapType = 'none'
    return () => {
      html.style.scrollSnapType = prevSnap
    }
  }, [])

  const rows = planRows(media)
  const total = media.length

  return (
    <div className="min-h-[100dvh] bg-oxidized-graphite text-bone-porcelain">
      <ProjectHeader />

      {/* Intro */}
      <motion.header
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-[1100px] px-6 pb-16 pt-[148px] md:pb-24"
      >
        <motion.p
          variants={lineReveal}
          className="font-copperplate text-[12px] uppercase tracking-[0.28em] text-synthetic-flesh/70"
        >
          {categoryLabel}
        </motion.p>
        <motion.h1
          variants={fadeInUp}
          className="mt-5 font-cormorant text-[clamp(30px,5vw,64px)] font-light italic leading-[1.05] tracking-[0.01em]"
        >
          {project.title}
        </motion.h1>
        {project.description && (
          <motion.p
            variants={fadeInUp}
            className="body-copy-lg mt-6 max-w-[62ch] whitespace-pre-line font-light text-bone-porcelain/70"
          >
            {project.description}
          </motion.p>
        )}
      </motion.header>

      {/* Media flow */}
      <div className="space-y-16 px-6 pb-24 md:space-y-28">
        {rows.map((row, ri) =>
          row.type === 'pair' ? (
            <div
              key={ri}
              className="mx-auto grid max-w-[1100px] grid-cols-1 items-end gap-8 sm:grid-cols-2"
            >
              {row.items.map((it, k) => (
                <div key={it.src} className="flex justify-center">
                  <GalleryMedia
                    item={it}
                    alt={`${project.title} — image ${row.start + k + 1}`}
                    index={row.start + k}
                    total={total}
                    maxH="max-h-[64vh]"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div key={ri} className="mx-auto max-w-[1100px]">
              <GalleryMedia
                item={row.item}
                alt={`${project.title} — image ${row.index + 1}`}
                index={row.index}
                total={total}
                maxH={SIZE[row.size]}
                align={row.align}
              />
            </div>
          )
        )}
      </div>

      {/* Footer: cycle to sibling projects */}
      <footer className="border-t border-bone-porcelain/10">
        <nav className="mx-auto flex max-w-[1100px] items-center justify-between gap-6 px-6 py-12">
          <Link
            href={prev.href}
            className="flex flex-col gap-1 text-bone-porcelain/55 transition-colors duration-300 hover:text-bone-porcelain"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-bone-porcelain/35">Previous</span>
            <span className="font-cormorant text-lg font-light italic">{prev.title}</span>
          </Link>
          <Link
            href="/#work"
            className="shrink-0 text-[11px] uppercase tracking-[0.24em] text-bone-porcelain/45 transition-colors duration-300 hover:text-bone-porcelain"
          >
            Index
          </Link>
          <Link
            href={next.href}
            className="flex flex-col items-end gap-1 text-right text-bone-porcelain/55 transition-colors duration-300 hover:text-bone-porcelain"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-bone-porcelain/35">Next</span>
            <span className="font-cormorant text-lg font-light italic">{next.title}</span>
          </Link>
        </nav>
      </footer>
    </div>
  )
}
