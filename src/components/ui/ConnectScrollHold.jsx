'use client'

import { useEffect } from 'react'

const DESKTOP = '(min-width: 1024px)' // mirrors ScrollStage — the tier that owns the sections

// A scroll is "settled" once no scroll event has fired for this long. iOS
// momentum keeps firing well past touchend, so touchend itself is far too early
// to measure against.
const IDLE_MS = 140

// How long to keep the offset pinned after that. Covers Safari's toolbar
// animation and the scroll re-resolution that lands at the end of it.
const HOLD_MS = 600

// Largest correction this will make. The shift being cancelled is the height of
// Safari's chrome (~50px on an iPhone); anything beyond this is not that, and is
// left alone rather than yanked.
const MAX_CORRECTION = 80

// A gesture older than this is not what settled the current scroll.
const GESTURE_TTL = 2000

// ── Connect's landing offset, held across the iOS Safari toolbar animation ───
//
// Connect is the last mobile section, so its snap point sits at exactly the
// document's maximum scroll offset — it is the only section that can be pinned
// against the end of the document. A finger scroll retracts Safari's URL bar,
// which changes the layout viewport by the chrome's height and so changes that
// maximum. Safari re-resolves the scroll position against the new geometry, and
// because the resolution lands *after* the snap animation has finished, it reads
// as the content lurching ~50px once everything had already come to rest.
//
// Nothing else on the page can hit this. The nav's links scroll through
// scrollToSection(), which is programmatic and never moves the toolbar; every
// other section has a section below it, so a viewport change just moves what is
// visible rather than forcing a re-resolution. Chrome and Firefox on iOS do not
// resize the layout viewport for their chrome at all.
//
// So the correction is scoped to exactly that case — Safari, below lg, a
// touch-driven scroll, resting on Connect — and it works by re-reading the
// offset from the section's own box every frame rather than trusting a number
// captured before the viewport moved. That makes it self-correcting whichever
// way Safari resolves, and a no-op on any pass where nothing actually drifts.
export default function ConnectScrollHold() {
  useEffect(() => {
    // The attribute is set by the inline script in layout.jsx before first
    // paint. Desktop Safari carries it too, hence the tier check below — there
    // is no retracting chrome there, so the hold would find no drift anyway.
    if (document.documentElement.getAttribute('data-browser') !== 'safari') return
    if (window.matchMedia(DESKTOP).matches) return

    let idleTimer = null
    let raf = null
    let holdUntil = 0
    let lastGesture = 0

    const stopHold = () => {
      if (raf !== null) cancelAnimationFrame(raf)
      raf = null
      holdUntil = 0
    }

    const hold = (target) => {
      const el = document.getElementById('connect')
      if (!el || performance.now() > holdUntil) return stopHold()

      // Re-derived from the live box, so a viewport change that legitimately
      // moves the section is followed rather than fought.
      const top = Math.round(el.getBoundingClientRect().top + window.scrollY)
      if (Math.abs(top - target) > MAX_CORRECTION) return stopHold()

      if (Math.abs(window.scrollY - top) > 1) {
        window.scrollTo({ top, behavior: 'instant' })
      }
      raf = requestAnimationFrame(() => hold(target))
    }

    const settled = () => {
      const el = document.getElementById('connect')
      if (!el) return

      // Only a scroll the reader's finger drove. touchmove rather than
      // touchstart is what separates this from a nav tap: tapping a menu link
      // fires touchstart, but only a drag fires touchmove, and the nav's own
      // route through scrollToSection() is already correct.
      if (performance.now() - lastGesture > GESTURE_TTL) return

      // A Connect taller than the screen is a valid resting place at any
      // interior offset (see the snap notes in globals.css), so there is no
      // single offset to hold and nothing here should invent one.
      if (el.offsetHeight > window.innerHeight + 2) return

      const top = Math.round(el.getBoundingClientRect().top + window.scrollY)
      // Within a chrome's height of Connect's own offset means the scroll came
      // to rest on Connect — either exactly on it, or already displaced by the
      // shift this exists to undo.
      if (Math.abs(window.scrollY - top) > MAX_CORRECTION) return

      stopHold()
      holdUntil = performance.now() + HOLD_MS
      raf = requestAnimationFrame(() => hold(top))
    }

    const onScroll = () => {
      window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(settled, IDLE_MS)
    }

    // The reader has taken over; nothing here should fight a deliberate scroll.
    const onTouchStart = () => stopHold()
    const onTouchMove = () => {
      lastGesture = performance.now()
    }

    // All passive: these only observe and correct, they never block a gesture.
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    return () => {
      window.clearTimeout(idleTimer)
      stopHold()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  return null
}
