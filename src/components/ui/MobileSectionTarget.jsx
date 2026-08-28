'use client'

import { useEffect } from 'react'
import { usePreloaderState } from '@/components/PreloaderProvider'
import { peekSectionTarget } from '@/lib/sectionTarget'

const DESKTOP = '(min-width: 1024px)' // mirrors ScrollStage — the tier that owns the sections

// How long to keep re-asserting the target after the page is interactive. The
// window has to outlast the last thing that moves the layout (webfont swap,
// the mobile bio's rewrap, the category sheets' first height measurement),
// which all land within a few hundred ms of paint.
const SETTLE_MS = 2000

// Lands the mobile home page on the section a cross-page link asked for.
//
// The desktop tree does this through ScrollStage, which seeds its slide index
// from the same handoff. Below lg there is no stage — the page is an ordinary
// scroll — and nothing consumed the target at all, so arriving from a project
// page fell back to the browser's own fragment scroll. That runs during load,
// against a layout that is still moving: webfonts have not swapped, the bio has
// not rewrapped, and WorkMobile has not yet measured its sheets. The browser
// lands on a pixel offset that was correct when it jumped and is not correct a
// moment later, which is why the hash read right while the wrong section showed.
//
// So the offset is re-read and re-applied every frame until the layout stops
// moving. Snapping is suspended for that window (a snap would resolve against
// the same stale geometry) and any real input from the user ends it early —
// they have taken over, and nothing here should fight a deliberate scroll.
export default function MobileSectionTarget() {
  const { loading } = usePreloaderState()

  useEffect(() => {
    // Wait for the preloader: it locks body scroll while it runs, and its exit
    // is the moment the page becomes the user's to look at.
    if (loading) return
    if (window.matchMedia(DESKTOP).matches) return

    // The hash is the fallback, not the source: a full page load carries it,
    // but sessionStorage is what survives Next's own URL handling (see
    // sectionTarget.js). Either way the id must name a section in this tree.
    const id = peekSectionTarget() ?? window.location.hash.replace('#', '')
    if (!id || !document.getElementById(id)) return

    const html = document.documentElement
    const previousSnap = html.style.scrollSnapType
    html.style.scrollSnapType = 'none'

    let raf = null
    const deadline = performance.now() + SETTLE_MS

    const stop = () => {
      if (raf === null) return
      cancelAnimationFrame(raf)
      raf = null
      html.style.scrollSnapType = previousSnap
      for (const type of ['wheel', 'touchstart', 'keydown']) {
        window.removeEventListener(type, stop)
      }
    }

    const hold = () => {
      const el = document.getElementById(id)
      if (el) {
        const top = Math.round(el.getBoundingClientRect().top + window.scrollY)
        // Only correct real drift — writing scrollTop every frame regardless
        // would cancel the user's momentum on the frame they start scrolling,
        // before the input listeners below get a chance to bow out.
        if (Math.abs(top - window.scrollY) > 1) window.scrollTo({ top, behavior: 'instant' })
      }
      if (performance.now() < deadline) raf = requestAnimationFrame(hold)
      else stop()
    }

    // Passive: these only ever end the hold, they never block the gesture.
    for (const type of ['wheel', 'touchstart', 'keydown']) {
      window.addEventListener(type, stop, { passive: true })
    }
    raf = requestAnimationFrame(hold)

    return stop
  }, [loading])

  return null
}
