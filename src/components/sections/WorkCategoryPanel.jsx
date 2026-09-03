'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { categoryImages } from '@/lib/assets'
import { staggerContainer, fadeInUp } from '@/lib/animations'
import ShimmerLine from '@/components/ui/ShimmerLine'

const EASE = [0.22, 1, 0.36, 1]
const SHEET_TRANSITION = { duration: 0.45, ease: EASE }

// Breathing room under the raised description. The action row is pinned to the
// sheet's base by mt-auto, so this lands as open space between the copy and the
// hairline rather than padding the sheet's bottom edge.
const RAISED_SLACK = 60

// Minimum slice of cover left visible above the sheet while it's collapsed —
// applied conditionally below, not while raised, so an expanded sheet can rise
// all the way up instead of stopping at this floor.
const COVER_FLOOR = 'min-h-[32vh]'

// One Work category, as a full-screen stage panel: a cover photograph with a
// docked sheet carrying the name, a one-line précis and the action row. "Read
// more" raises the sheet over the cover to reveal the full description, "Close"
// lowers it again (as does tapping the cover); "See Projects" is a real route and
// stays on screen in both states.
//
// `overlayTextColor` is the editor's existing light/dark switch for the cover and
// it drives the whole sheet polarity: "dark" means dark ink, i.e. a bright
// photograph, i.e. the porcelain sheet. SectionStage reads the same field to pick
// this panel's nav theme.
//
// The sheet is inert to touch. It carried a drag gesture (pull up to raise, flick
// down to close) which read every vertical touch that started on it, so the sheet
// moved under a finger that was only trying to move the page. "Read more" /
// "Close" and the cover tap are the whole interface now, and they are buttons.
export default function WorkCategoryPanel({ cat, ui }) {
  const reduced = useReducedMotion()
  const sheetId = useId()
  const first = cat.projects[0]
  const image = categoryImages[cat.slug]?.mobile
  const light = cat.overlayTextColor === 'dark' // light-world sheet (porcelain)

  // Both ends of the height animation have to be pixel values. Animating to
  // `auto` looked clean for a moment and then snapped: Framer resolves `auto`
  // once, up front, but this sheet's layout changes in the very same commit (the
  // copy region swaps between in-flow and absolute), so the tween ran toward a
  // stale number and the browser corrected it on the final frame.
  //
  // So both are measured. The two states differ by exactly one thing — the copy
  // region holds the précis or the description — and both of those are always in
  // the DOM at the right width, so one pass yields both heights:
  //
  //   chrome    = trim + title + action row + gaps + padding + border
  //   collapsed = chrome + précis
  //   raised    = chrome + description + slack
  const sheetRef = useRef(null)
  const contentRef = useRef(null)
  const precisRef = useRef(null)
  const descriptionRef = useRef(null)
  const chromeRef = useRef(null)
  const [collapsedHeight, setCollapsedHeight] = useState(null)
  const [raisedHeight, setRaisedHeight] = useState(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const column = contentRef.current
    const sheet = sheetRef.current
    const precis = precisRef.current
    const description = descriptionRef.current
    if (!column || !sheet || !precis || !description) return

    const measure = () => {
      const style = getComputedStyle(sheet)
      // The column sits inside the sheet's padding and the height we set is a
      // border-box, so padding and the top border have to be added back. Read
      // rather than hardcoded, so this can't drift out of step with the classes.
      const box =
        parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth)
      const precisH = precis.getBoundingClientRect().height
      const descriptionH = description.getBoundingClientRect().height

      // Chrome is only readable while collapsed — raised, the column is flex-1
      // and reports the sheet's height back at us instead of its content's. It
      // doesn't change between states, so the last collapsed reading holds.
      if (!expanded) chromeRef.current = column.getBoundingClientRect().height - precisH
      if (chromeRef.current == null) return

      const chrome = chromeRef.current + box
      const collapsed = Math.ceil(chrome + precisH)
      setCollapsedHeight(collapsed)
      // No viewport cap: the raised sheet is exactly its own description plus
      // slack. Where that overruns the panel, PanelScroll takes the overflow.
      setRaisedHeight(Math.max(collapsed, Math.ceil(chrome + descriptionH + RAISED_SLACK)))
    }

    // The description is measured off the paragraph itself, not its wrapper:
    // raised, that wrapper is a flex child and would report the region's height
    // back rather than the copy's. Observing the paragraph is also what catches
    // a reflow — rotating the phone rewraps it and the new height arrives here.
    const observer = new ResizeObserver(measure)
    observer.observe(column)
    observer.observe(precis)
    observer.observe(description)
    return () => observer.disconnect()
  }, [expanded])

  const tone = light
    ? {
        scrim: 'linear-gradient(to bottom, rgba(243,238,232,0.14), rgba(243,238,232,0.3) 55%)',
        scrimRaised: 'linear-gradient(to bottom, rgba(243,238,232,0.14), rgba(243,238,232,0.24) 55%)',
        coverOpacity: 0.8,
        sheet: 'rgba(243,238,232,0.66)',
        sheetRaised: 'rgba(243,238,232,0.84)',
        border: 'rgba(26,26,28,0.14)',
        // Same face and size as the dark-world title below, one weight up: the
        // thin cut holds against a bright photograph but goes wiry as graphite
        // ink on the porcelain sheet, so this world carries it at 300.
        title: 'font-ivyora-display font-light text-[1.5rem] leading-[1.1] tracking-[0.06em] text-oxidized-graphite',
        copy: 'text-oxidized-graphite/[0.78]',
        hairline: 'bg-oxidized-graphite/[0.16]',
        ink: 'text-oxidized-graphite',
        inkQuiet: 'text-oxidized-graphite/60',
        quietRule: 'bg-oxidized-graphite/60',
        shimmer: 'dark',
      }
    : {
        scrim: 'linear-gradient(to top, rgba(26,26,28,0.5), rgba(26,26,28,0.05) 50%)',
        scrimRaised: 'linear-gradient(to top, rgba(26,26,28,0.6), rgba(26,26,28,0.15) 50%)',
        coverOpacity: 0.75,
        // #1b1e20 rather than the page ground: a hair cooler, so the sheet reads
        // as its own plane over the cover instead of a hole cut in it.
        sheet: 'rgba(27,30,32,0.86)',
        sheetRaised: 'rgba(27,30,32,0.94)',
        border: 'rgba(243,238,232,0.18)',
        title: 'font-ivyora-display font-thin text-[1.5rem] leading-[1.1] tracking-[0.06em] text-[#D8D4CF]',
        copy: 'text-[#D8D4CF]/80',
        hairline: 'bg-bone-porcelain/20',
        // Held just off full porcelain: at 100% "See Projects" was the brightest
        // thing on the sheet and pulled ahead of the title.
        ink: 'text-bone-porcelain/80',
        inkQuiet: 'text-[#D8D4CF]/60',
        quietRule: 'bg-[#D8D4CF]/60',
        shimmer: 'light',
      }

  const transition = reduced ? { duration: 0 } : SHEET_TRANSITION

  return (
    <article
      data-nav-theme={light ? 'light' : 'dark'}
      aria-label={cat.label}
      className="section-fullscreen relative flex w-full flex-col overflow-hidden bg-oxidized-graphite"
    >
      {image && (
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: expanded ? tone.coverOpacity : 1 }}
          transition={transition}
        >
          <Image src={image} alt={cat.label} fill sizes="100vw" className="object-cover" />
        </motion.div>
      )}

      {/* Two scrims rather than one animated gradient: a background-image can't
          be tweened, so the raised variant crossfades over the base and both
          keep their exact stops. */}
      <div className="absolute inset-0" style={{ backgroundImage: tone.scrim }} />
      <motion.div
        className="absolute inset-0"
        style={{ backgroundImage: tone.scrimRaised }}
        initial={false}
        animate={{ opacity: expanded ? 1 : 0 }}
        transition={transition}
      />

      {/* The cover slice above the sheet — the flex spacer that takes whatever
          the sheet leaves, down to COVER_FLOOR while collapsed so a peek of the
          photograph always shows, with no floor once raised. Tapping it dismisses
          a raised sheet; the button only mounts while raised, so it never eats a
          tap collapsed. */}
      <div className={`relative flex-1 ${expanded ? '' : COVER_FLOOR}`}>
        {expanded && (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => setExpanded(false)}
            className="absolute inset-0 z-10 cursor-default"
          />
        )}
      </div>

      {/* Two nested motion elements on purpose: the outer one owns the sheet's
          own state (height, ground), the inner one is the entrance stagger
          container. They can't be one element — variant labels and an object
          `animate` don't coexist, and the labels are what propagate the stagger
          down to the children. */}
      <motion.div
        id={sheetId}
        ref={sheetRef}
        initial={false}
        animate={{
          height: (expanded ? raisedHeight : collapsedHeight) ?? 'auto',
          backgroundColor: expanded ? tone.sheetRaised : tone.sheet,
        }}
        transition={transition}
        style={{ borderTopColor: tone.border }}
        className="relative z-20 flex shrink-0 flex-col overflow-hidden border-t px-6 pb-[max(46px,env(safe-area-inset-bottom))] pt-6"
      >
        {/* Only claims the sheet's height once raised — collapsed it keeps its
            natural height, which is what the measurement above reads. */}
        <motion.div
          ref={contentRef}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className={`flex flex-col gap-[18px] ${expanded ? 'min-h-0 flex-1' : ''}`}
        >
          {/* Trim, not a handle — there is no gesture on this sheet; it marks the
              raised state the way the same rule sits above About's bio. Its own
              `animate` stops the stagger propagating here, which is what keeps it
              on the sheet's state rather than in the entrance. */}
          <motion.span
            aria-hidden="true"
            initial={false}
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={transition}
            className="block shrink-0"
          >
            <ShimmerLine tone={tone.shimmer} orientation="horizontal" className="w-[34px]" />
          </motion.span>

          <motion.h2 variants={fadeInUp} className={`shrink-0 uppercase ${tone.title}`}>
            {cat.label}
          </motion.h2>

          {/* Copy region. Whichever state is active sits in normal flow and the
              other overlays it absolutely — that's what lets the collapsed
              sheet's `auto` height measure the précis alone, with the long
              description clipped by the sheet's overflow-hidden until wanted. */}
          <motion.div variants={fadeInUp} className={`relative ${expanded ? 'min-h-0 flex-1' : ''}`}>
            <motion.p
              ref={precisRef}
              aria-hidden={expanded}
              initial={false}
              animate={{ opacity: expanded ? 0 : 1 }}
              transition={transition}
              className={`body-copy font-light ${tone.copy} ${
                expanded ? 'pointer-events-none absolute inset-x-0 top-0' : ''
              }`}
            >
              {cat.summary}
            </motion.p>

            <motion.div
              aria-hidden={!expanded}
              initial={false}
              animate={{ opacity: expanded ? 1 : 0 }}
              transition={transition}
              className={expanded ? '' : 'pointer-events-none absolute inset-x-0 top-0'}
            >
              {/* One block, not a stack of <p>: the cover reads as a single
                  paragraph with blank lines between stanzas, so the build-time
                  paragraphs are rejoined with <br><br>. Editor formatting
                  (bold / italic / links) rides along inside the HTML. */}
              <p
                ref={descriptionRef}
                className={`body-copy rich-text font-light ${tone.copy}`}
                dangerouslySetInnerHTML={{ __html: cat.descriptionMobileHtml.join('<br><br>') }}
              />
            </motion.div>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-auto flex shrink-0 flex-col gap-[18px]">
            <div className={`h-px w-full ${tone.hairline}`} />

            <div className="flex items-center justify-between gap-4">
              {/* py-3 -my-3 on both cues: a >=44px tap box without growing the
                  type or opening up the row. */}
              <Link
                href={`/work/${cat.slug}/${first.slug}`}
                className={`-my-3 inline-flex items-center gap-3 py-3 font-neue-haas-display text-[13px] uppercase tracking-[0.18em] ${tone.ink}`}
              >
                {ui.seeProjects}
                <ShimmerLine tone={tone.shimmer} orientation="horizontal" className="w-9" />
              </Link>

              {/* The quiet sibling gets a plain rule, not a second travelling
                  beam — two shimmers side by side would compete for the glance. */}
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-controls={sheetId}
                className={`-my-3 inline-flex items-center gap-3 py-3 font-neue-haas-display text-[11px] uppercase tracking-[0.22em] ${tone.inkQuiet}`}
              >
                {expanded ? ui.closeSheet : ui.readMore}
                <span aria-hidden="true" className={`block h-px w-[22px] ${tone.quietRule}`} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </article>
  )
}
