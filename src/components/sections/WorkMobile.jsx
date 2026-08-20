'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { useNavTheme } from '@/components/NavThemeProvider'
import { categoryImages } from '@/lib/assets'
import { staggerContainer, fadeInUp } from '@/lib/animations'
import SectionFade from '@/components/ui/SectionFade'
import ShimmerLine from '@/components/ui/ShimmerLine'

const EASE = [0.22, 1, 0.36, 1]
const SHEET_TRANSITION = { duration: 0.45, ease: EASE }
const DESKTOP = '(min-width: 1024px)' // mirrors ScrollStage — the tier that owns the nav theme

// The raised sheet is sized by its own description — the whole description, with
// no ceiling. It used to be capped at a ratio of the viewport, which kept a slice
// of the cover visible but pushed any longer category into a scroll region nested
// inside the scrolling page: two scrolls competing for the same drag, and the
// only way to reach the end of the copy. The cover slice is now held open by the
// spacer above the sheet instead (COVER_FLOOR), and when the description outruns
// what is left the section simply grows past the viewport and the page scrolls
// on — the same trade About's mobile bio already makes, and globals.css already
// allows for sections taller than one screen.
//
// Breathing room under the description. The action row is pinned to the sheet's
// base by mt-auto, so this lands as open space between the copy and the hairline
// rather than padding the sheet's bottom edge.
const RAISED_SLACK = 60

// Minimum slice of cover left visible above the sheet in either state. Mirrors
// About's mobile bio, whose cover takes whatever its sheet leaves down to a
// floor.
const COVER_FLOOR = 'min-h-[32vh]'

// Mobile Work (below lg): one full-viewport cover per category, stacked in order
// (Exteneral → Physical Works), each with a docked sheet at the bottom carrying
// the name, a one-line précis and the action row. "Read more" raises the sheet
// over the cover to reveal the full description, "Close" lowers it again (as
// does tapping the cover); "See Projects" is a real route and stays on screen in
// both states. Every one of those is a button — the sheet itself is inert to
// touch, so nothing on this page competes with the page scroll.
export default function WorkMobile() {
  const { t } = useLanguage()
  const c = t.work
  const { setTheme } = useNavTheme()

  // One sheet open at a time — raising a second collapses the first.
  const [openSlug, setOpenSlug] = useState(null)

  // The nav bar's colour has to follow the cover currently under it: the light-
  // world category (a bright photograph) needs graphite chrome or the hamburger
  // vanishes into it. NavThemeProvider notes that a per-section observer can't
  // work — that's about the desktop stage, where the cross-dissolving sections
  // all occupy the viewport at once. Below lg they're sequential, so an observer
  // is exactly the right tool.
  const articlesRef = useRef(new Map())
  const registerArticle = useCallback((slug, node) => {
    if (node) articlesRef.current.set(slug, node)
    else articlesRef.current.delete(slug)
  }, [])

  // Joined into a string so the effect below doesn't re-run on every render from
  // a fresh array identity.
  const lightWorldSlugs = c.categories
    .filter((cat) => cat.overlayTextColor === 'dark')
    .map((cat) => cat.slug)
    .join(',')

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP)
    const lightWorld = new Set(lightWorldSlugs ? lightWorldSlugs.split(',') : [])
    let observer = null
    let owned = false // true while our light theme is the one on the bar

    const engage = () => {
      if (observer) return
      const under = new Set() // light-world covers currently under the bar

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const slug = entry.target.dataset.slug
            if (entry.isIntersecting) under.add(slug)
            else under.delete(slug)
          }
          // Falling back to dark whenever no light cover is up there is what
          // keeps About and Connect right on the way past — neither of them
          // sets the theme itself.
          owned = under.size > 0
          setTheme(owned ? 'light' : 'dark')
        },
        // Only the top band counts: that's the strip the bar actually sits on.
        { rootMargin: '0px 0px -85% 0px' }
      )

      for (const [slug, node] of articlesRef.current) {
        if (lightWorld.has(slug)) observer.observe(node)
      }
    }

    // At lg this whole tree is display:none, so the observer would report
    // nothing, reset the theme to dark, and fight ScrollStage — which owns the
    // theme at that tier. Hence the breakpoint gate, mirroring the stage's own.
    const disengage = () => {
      if (!observer) return
      observer.disconnect()
      observer = null
      // Only hand the theme back if it was ours to hand back. Crossing the
      // breakpoint fires this and ScrollStage's own engage in an undefined
      // order, and an unconditional reset here would stomp the theme the stage
      // had just set for its current section.
      if (owned) setTheme('dark')
      owned = false
    }

    const sync = () => (mql.matches ? disengage() : engage())
    sync()
    mql.addEventListener('change', sync)

    return () => {
      mql.removeEventListener('change', sync)
      observer?.disconnect()
    }
  }, [lightWorldSlugs, setTheme])

  return (
    // id + smooth scroll (globals) let the nav's #work link land here.
    <section id="work" aria-label="Work" className="lg:hidden">
      {c.categories.map((cat) => (
        <SectionFade key={cat.slug}>
          <CategoryCover
            cat={cat}
            ui={c}
            expanded={openSlug === cat.slug}
            onToggle={() => setOpenSlug((slug) => (slug === cat.slug ? null : cat.slug))}
            onClose={() => setOpenSlug((slug) => (slug === cat.slug ? null : slug))}
            registerArticle={registerArticle}
          />
        </SectionFade>
      ))}
    </section>
  )
}

// Per-category cover + docked sheet. `overlayTextColor` is the editor's existing
// light/dark switch for the cover, and it drives the whole sheet polarity here:
// "dark" means dark ink, i.e. a bright photograph, i.e. the porcelain sheet.
function CategoryCover({ cat, ui, expanded, onToggle, onClose, registerArticle }) {
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
  //   raised    = chrome + description + slack (no cap — see RAISED_SLACK)
  const sheetRef = useRef(null)
  const contentRef = useRef(null)
  const precisRef = useRef(null)
  const descriptionRef = useRef(null)
  const chromeRef = useRef(null)
  const [collapsedHeight, setCollapsedHeight] = useState(null)
  const [raisedHeight, setRaisedHeight] = useState(null)

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
      // slack, so the copy always fits and never needs to scroll inside.
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
        sheet: 'rgba(243,238,232,0.86)',
        sheetRaised: 'rgba(243,238,232,0.94)',
        border: 'rgba(26,26,28,0.14)',
        title: 'font-neue-haas-display text-[1.75rem] leading-[1.15] tracking-[0.12em] text-oxidized-graphite',
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
        sheet: 'rgba(26,26,28,0.86)',
        sheetRaised: 'rgba(26,26,28,0.94)',
        border: 'rgba(243,238,232,0.18)',
        title: 'font-ivyora-display font-thin text-[2.125rem] leading-[1.1] tracking-[0.06em] text-[#D8D4CF]',
        copy: 'text-[#D8D4CF]/80',
        hairline: 'bg-bone-porcelain/20',
        ink: 'text-bone-porcelain',
        inkQuiet: 'text-[#D8D4CF]/60',
        quietRule: 'bg-[#D8D4CF]/60',
        shimmer: 'light',
      }

  const transition = reduced ? { duration: 0 } : SHEET_TRANSITION

  // The sheet is inert to touch. It carried a drag gesture (pull up to raise,
  // flick down to close) which read every vertical touch that started on it,
  // so the sheet moved under a finger that was only trying to scroll the page —
  // and rubber-banded even when it had nowhere to go. "Read more" / "Close" and
  // the cover tap are the whole interface now, and they are buttons, so the
  // sheet never intercepts a scroll.
  //
  // Laid out in flow rather than absolutely: the sheet has to be able to make
  // the section taller than the viewport when a long description opens, and an
  // absolute `bottom-0` child contributes nothing to its parent's height, so it
  // was clipped instead. The cover behind it stays absolute and spans whatever
  // the article ends up being.
  return (
    <article
      ref={(node) => registerArticle(cat.slug, node)}
      data-slug={cat.slug}
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

      {/* The cover slice above the sheet. It is the flex spacer that takes
          whatever the sheet leaves, down to COVER_FLOOR — past that the article
          grows and the page scrolls on. Tapping it dismisses a raised sheet; the
          button only mounts while raised, so it never eats a tap collapsed. */}
      <div className={`relative ${COVER_FLOOR} flex-1`}>
        {expanded && (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={onClose}
            className="absolute inset-0 z-10 cursor-default"
          />
        )}
      </div>

      {/* Two nested motion elements on purpose: the outer one owns the sheet's
          own state (height, ground), the inner one is the entrance stagger
          container. They can't be one element — variant labels and an object
          `animate` don't coexist, and the labels are what propagate the stagger
          down to the children.

          The whole panel — title, description, divider, See Projects, Read more
          — is this section's bottom-edge group, so the chrome compensation
          (dvh-bottom-shift) rides the sheet itself and every internal gap is
          left exactly as designed. It is safe on this element rather than on a
          wrapper: it animates only height and backgroundColor, so Framer never
          writes to `transform`. */}
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
        className="dvh-bottom-shift relative z-20 flex shrink-0 flex-col overflow-hidden border-t px-6 pb-[max(2.875rem,env(safe-area-inset-bottom))] pt-6"
      >
        {/* Only claims the sheet's height once raised — collapsed it keeps its
            natural height, which is what the measurement above reads. */}
        <motion.div
          ref={contentRef}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className={`flex flex-col gap-[1.125rem] ${expanded ? 'min-h-0 flex-1' : ''}`}
        >
          {/* Trim, not a handle — there is no gesture on this sheet any more (see
              above); it marks the raised state the way the same rule sits above
              About's mobile bio. Its own `animate` stops the stagger propagating
              here, which is what keeps it on the sheet's state rather than in
              the entrance. */}
          <motion.span
            aria-hidden="true"
            initial={false}
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={transition}
            className="block shrink-0"
          >
            <ShimmerLine tone={tone.shimmer} orientation="horizontal" className="w-[2.125rem]" />
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

          <motion.div variants={fadeInUp} className="mt-auto flex shrink-0 flex-col gap-[1.125rem]">
            <div className={`h-px w-full ${tone.hairline}`} />

            <div className="flex items-center justify-between gap-4">
              {/* py-3 -my-3 on both cues: a ≥44px tap box without growing the
                  type or opening up the row. */}
              <Link
                href={`/work/${cat.slug}/${first.slug}`}
                className={`-my-3 inline-flex items-center gap-3 py-3 font-neue-haas-display text-[0.8125rem] uppercase tracking-[0.18em] ${tone.ink}`}
              >
                {ui.seeProjects}
                <ShimmerLine tone={tone.shimmer} orientation="horizontal" className="w-9" />
              </Link>

              {/* The quiet sibling gets a plain rule, not a second travelling
                  beam — two shimmers side by side would compete for the glance. */}
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={expanded}
                aria-controls={sheetId}
                className={`-my-3 inline-flex items-center gap-3 py-3 font-neue-haas-display text-[0.6875rem] uppercase tracking-[0.22em] ${tone.inkQuiet}`}
              >
                {expanded ? ui.closeSheet : ui.readMore}
                <span aria-hidden="true" className={`block h-px w-[1.375rem] ${tone.quietRule}`} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </article>
  )
}
