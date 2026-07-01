'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp, lineReveal } from '@/lib/animations'
import GalleryMedia from './GalleryMedia'
import ProjectHeader from './ProjectHeader'

// ── Gallery density knobs ────────────────────────────────────────────────────
// The gallery auto-fits images into justified rows (Flickr-style) — it isn't a
// fixed grid, so the number per row emerges from the container width and the
// images' aspect ratios. Because wider containers pack more per row, a single
// target height gives ~2 on a laptop, ~3 on a monitor, ~4 on a large display —
// and MAX_COLUMNS caps the top end so it never exceeds 4.
//
//   TARGET_ROW_HEIGHT — the main density dial. Higher → fewer, taller images per
//     row; lower → more, smaller. ~900 lands on 2 per row at 14" laptop width.
//     Try 760 for ~3 on a laptop, 1000+ to push toward 1–2.
//   MAX_COLUMNS — hard ceiling per row on any screen size.
//   GAP — pixel gutter between images (matches the gap-2 class below).
// (Container padding `px-4 sm:px-6 lg:px-10` also nudges density: more padding →
//  narrower usable width → slightly fewer per row.)
const TARGET_ROW_HEIGHT = 900
const MAX_COLUMNS = 4
const GAP = 8 // px, matches the gap-2 gutter
const DEFAULT_WIDTH = 1280 // assumed width for the static/SSR render before measuring

// Greedy justified-rows layout (Flickr-style). A row closes once its
// fill-to-width height drops to ≤ targetH, or once it hits MAX_COLUMNS cells; the
// trailing row is kept at targetH (its natural width is < container) and flagged
// so it can be centered.
function computeRows(items, width, gap, targetH, maxColumns) {
  const rows = []
  let row = []
  let arSum = 0
  for (const item of items) {
    const ar = item.width && item.height ? item.width / item.height : 0.8
    row.push({ item, ar })
    arSum += ar
    const rowHeight = (width - gap * (row.length - 1)) / arSum
    if (rowHeight <= targetH || row.length >= maxColumns) {
      rows.push({ cells: row, height: rowHeight, full: true })
      row = []
      arSum = 0
    }
  }
  if (row.length) rows.push({ cells: row, height: targetH, full: false })
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

  // Measure the content width so rows can be justified; recompute on resize.
  const wrapRef = useRef(null)
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const rows = computeRows(media, width, GAP, TARGET_ROW_HEIGHT, MAX_COLUMNS)

  return (
    <div className="min-h-[100dvh] bg-oxidized-graphite text-bone-porcelain">
      <ProjectHeader />

      {/* Intro */}
      <motion.header
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-[1100px] px-6 pb-16 pt-[148px] text-center md:pb-24"
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
            className="body-copy-lg mx-auto mt-6 max-w-[100ch] whitespace-pre-line font-light text-bone-porcelain/70"
          >
            {project.description}
          </motion.p>
        )}
      </motion.header>

      {/* Media — justified rows. Full rows fill the width; a short trailing row is
          kept at target height and centered. */}
      <div ref={wrapRef} className="px-4 pb-24 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-2">
          {rows.map((r, ri) => {
            let imgIndex = 0
            for (let k = 0; k < ri; k++) imgIndex += rows[k].cells.length
            return (
              <div
                key={ri}
                className={`flex gap-2 ${r.full ? '' : 'justify-center'}`}
              >
                {r.cells.map(({ item, ar }, ci) => (
                  <GalleryMedia
                    key={item.src}
                    item={item}
                    alt={`${project.title} — image ${imgIndex + ci + 1}`}
                    displayWidth={r.height * ar}
                  />
                ))}
              </div>
            )
          })}
        </div>
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
