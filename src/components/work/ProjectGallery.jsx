'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { staggerContainer, fadeInUp } from '@/lib/animations'
import GalleryMedia from './GalleryMedia'
import ProjectHeader from './ProjectHeader'
import ProjectNav from './ProjectNav'
import Footer from '@/components/ui/Footer'
import ShimmerArrow from '@/components/ui/ShimmerArrow'

// ── Gallery density knobs ────────────────────────────────────────────────────
// The gallery auto-fits items into justified rows (Flickr-style): a row closes
// once its fill-to-width height drops to ≤ TARGET_ROW_HEIGHT, or once it hits
// MAX_COLUMNS. Density therefore emerges from container width × aspect ratios.
//
// Most items carry no dimensions in media.generated.json and fall back to the 0.8
// portrait aspect (see computeRows), so ordinary rows are N equal-width columns.
// The exception is a WIDE item — one whose declared aspect ratio is ≥ WIDE_AR
// (a 16:9 or wider image; declare its width/height in the project JSON): it always
// takes its own full-width row rather than packing 2-up.
//
//   WIDE_AR — aspect ratio at/above which an item spans a full row on its own.
//     0.8 is the portrait fallback and 16:9 is 1.78, so 1.6 catches 16:9/16:10 and
//     wider while leaving 3:2 (1.5) and 4:3 (1.33) to pack normally.
//   MAX_COLUMNS — hard ceiling per row, and the only thing that can cap the top
//     end. TARGET_ROW_HEIGHT alone cannot hold 2-up across the desktop range: at
//     1024 the row must not close at 1, which needs targetH < ~1180, while at
//     3440 closing at 2 by height needs targetH ≥ ~2090. No single value does
//     both, so the ceiling does the capping and targetH only picks where 1-up
//     flips to 2-up.
//   TARGET_ROW_HEIGHT — that flip point. At 1000, rows close at 1 up to ~768 and
//     run 2-up from ~1024 on. Raise it to push the 2-up threshold wider; lower it
//     to bring 2-up to narrower screens.
//   GAP — pixel gutter between items; must match the gap-4 class below.
// (Container padding `px-4 sm:px-6 lg:px-10` also nudges density: more padding →
//  narrower usable width → slightly fewer per row.)
const TARGET_ROW_HEIGHT = 1000
const MAX_COLUMNS = 2
const WIDE_AR = 1.6 // ≥ this ⇒ its own full-width row (portrait fallback 0.8, 16:9 1.78)
const GAP = 32 // px, matches the gap-4 gutter
const DEFAULT_WIDTH = 1280 // assumed width for the static/SSR render before measuring

// Greedy justified-rows layout (Flickr-style). A row closes once its
// fill-to-width height drops to ≤ targetH, or once it hits MAX_COLUMNS cells; the
// trailing row is kept at targetH (its natural width is < container) and flagged
// so it can be centered. A WIDE item (ar ≥ WIDE_AR) breaks out: it flushes any
// open row and takes its own full-width row.
function computeRows(items, width, gap, targetH, maxColumns) {
  const rows = []
  let row = []
  let arSum = 0
  // Close a still-open (unfilled) row as a centered trailing-style row — used when
  // a wide item interrupts a pending pair, so a lone leftover portrait centers.
  const flushOpen = () => {
    if (!row.length) return
    rows.push({ cells: row, height: targetH, full: false })
    row = []
    arSum = 0
  }
  for (const item of items) {
    const ar = item.width && item.height ? item.width / item.height : 0.8
    if (ar >= WIDE_AR) {
      flushOpen()
      // height = width/ar ⇒ displayWidth (height*ar) = the full container width, so
      // the image spans the row; GalleryMedia (w-full h-auto) sets its own height.
      rows.push({ cells: [{ item, ar }], height: width / ar, full: true })
      continue
    }
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

export default function ProjectGallery({ project, media, siblings = [], nextProject }) {
  const { t } = useLanguage()

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
  // clientWidth includes the wrapper's px-* padding, so subtract it — otherwise a
  // full-width row overflows by the padding. Measure the padded wrapper (whose
  // width is viewport-driven and stable), NOT the inner flex column: that column
  // is stretched by any row that overflows, which would feed an inflated width
  // straight back into the layout.
  const wrapRef = useRef(null)
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => {
      const cs = getComputedStyle(el)
      const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
      setWidth(el.clientWidth - pad)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Editors can drop individual assets below lg (wide crops that lose their
  // subject on a phone). The layout is computed in JS, so hiding with CSS would
  // leave a hole in the row — the item has to leave the list before it is packed.
  // The query is inverted deliberately: useMediaQuery returns false until mount,
  // so the static render is the desktop one, matching DEFAULT_WIDTH above. Mobile
  // then drops the flagged items on the same post-mount pass that measures the
  // real container width, rather than adding a second reflow.
  const isMobile = useMediaQuery('(max-width: 1023.98px)')
  const visible = isMobile ? media.filter((m) => !m.hideOnMobile) : media

  const rows = computeRows(visible, width, GAP, TARGET_ROW_HEIGHT, MAX_COLUMNS)

  return (
    <div className="min-h-[100dvh] bg-oxidized-graphite text-bone-porcelain">
      <ProjectHeader />
      <ProjectNav siblings={siblings} />

      {/* Rule between the fixed header and the page content. It sits on the
          gallery's own margins rather than the header's, so it lines up with the
          images below it. In flow, not fixed — a fixed rule would ride down the
          page cutting across the gallery.
          Below md the global <Nav> (28px py + 20px hamburger row) is the header,
          so 76px keeps the gap under it equal to the 28px gap above it; at md the
          desktop ProjectHeader takes over and needs the taller 104px clearance. */}
      <div className="px-4 pt-[76px] sm:px-6 md:pt-[104px] lg:px-10">
        <div className="h-px w-full bg-bone-porcelain/25" />
      </div>

      {/* Intro — left-aligned, indented off the rule's left end (lg: 40px margin
          + 88px indent). Padding is per-side so the indent can't collide with a
          shorthand px- utility. */}
      <motion.header
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="pb-16 pl-4 pr-4 pt-14 sm:pl-6 sm:pr-6 md:pb-24 lg:pl-[128px] lg:pr-10"
      >
        <motion.h1
          variants={fadeInUp}
          className="-ml-1 flex items-center gap-4 font-neue-haas-display text-[clamp(30px,5vw,44px)] font-light italic leading-[1.05] tracking-[0.01em]"
        >
          <span className="opacity-80">{project.title}</span>
          {nextProject && (
            <Link
              href={nextProject.href}
              aria-label={`${t.work.nextProject}: ${nextProject.title}`}
              className="group inline-flex shrink-0 items-center not-italic lg:hidden"
            >
              <ShimmerArrow
                tone="light"
                className="h-3 w-9 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          )}
        </motion.h1>
        {project.descriptionHtml.length > 0 && (
          <motion.p
            variants={fadeInUp}
            className="rich-text mt-6 max-w-[85ch] text-[1rem] font-light leading-[1.7] tracking-[0.02em] lg:tracking-[0.04em] text-pretty text-bone-porcelain/70"
          >
            {/* Both variants render; CSS picks one so the static/server markup
                matches on hydration. descriptionMobile falls back to the desktop
                text at build time, so these are identical until the editor sets
                a distinct mobile description.
                The HTML is built by scripts/build-content.mjs from the CMS
                markdown — escaped there, and limited to <strong>/<em>/<a>.
                Paragraphs rejoin with <br><br> to keep this one block. */}
            <span
              className="lg:hidden"
              dangerouslySetInnerHTML={{ __html: project.descriptionMobileHtml.join('<br><br>') }}
            />
            <span
              className="hidden lg:inline"
              dangerouslySetInnerHTML={{ __html: project.descriptionHtml.join('<br><br>') }}
            />
          </motion.p>
        )}
      </motion.header>

      {/* Media — justified rows. Full rows fill the width; a short trailing row is
          kept at target height and centered. */}
      {/* overflow-x-clip: the imageReveal scale (1.04) on a below-the-fold
          full-width image would otherwise spill past the viewport and flash a
          horizontal scrollbar on load; clipping the sub-pixel edge bleed is
          imperceptible and keeps the page from ever scrolling sideways. */}
      <div ref={wrapRef} className="overflow-x-clip px-4 pb-24 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4">
          {rows.map((r, ri) => {
            let imgIndex = 0
            for (let k = 0; k < ri; k++) imgIndex += rows[k].cells.length
            return (
              <div
                key={ri}
                className={`flex gap-4 ${r.full ? '' : 'justify-center'}`}
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

      {/* Footer — shared strip (rule + location / copyright / email row). Hidden
          on mobile; the global <Nav> hamburger is the single mobile chrome here
          (see ProjectHeader), so this only shows once that desktop header takes
          over at md. */}
      <footer className="hidden px-4 pt-6 sm:px-6 md:block lg:px-10">
        <Footer />
      </footer>
    </div>
  )
}
