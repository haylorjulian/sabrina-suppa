'use client'

import { useEffect, useRef, useState } from 'react'

// The scroll region inside one stage panel.
//
// The stage is fixed and the document no longer scrolls, so a section that
// outgrows the viewport has nowhere to grow into. Two sections deliberately can:
// About's bio and a category sheet raised to the full height of its description
// (see the comments in About.jsx and WorkCategoryPanel.jsx — both chose "let the
// section grow and the page scrolls on" over a nested scroll region).
//
// That trade is now the other way round. There is no page scroll to compete
// with, so a region here competes with nothing: it is a continuous scroller
// inside a *discrete* panel advance, not two continuous scrollers fighting one
// drag. And it is no longer optional — with no scrollable document iOS Safari
// never retracts its toolbar, so the viewport is pinned to its small state and
// the ~60px a scroll used to reclaim is gone for good. On a 375x667 phone the
// About bio overruns by roughly that much.
//
// Inert when the content fits: `scrollHeight === clientHeight` means no scrollbar,
// no focus stop, and `shouldIgnore` in SectionStage skips it entirely.
export default function PanelScroll({ active, label, children }) {
  const ref = useRef(null)
  const [scrollable, setScrollable] = useState(false)

  // A webfont swap, a rotation, or a sheet's first height measurement all change
  // the answer with no scroll at all — the same reason the category sheets need a
  // ResizeObserver rather than a one-shot read.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setScrollable(el.scrollHeight - el.clientHeight > 1)
    const observer = new ResizeObserver(check)
    observer.observe(el)
    for (const child of el.children) observer.observe(child)
    check()
    return () => observer.disconnect()
  }, [])

  // Rewind while the panel is off stage. Returning to About must show it from
  // the top, not wherever it was left — the panel is a place, not a scrollback.
  useEffect(() => {
    if (!active && ref.current) ref.current.scrollTop = 0
  }, [active])

  return (
    <div
      ref={ref}
      data-panel-scroll=""
      // Safari won't focus a scroll container on its own, so without this a
      // keyboard user cannot reach copy that only exists below the fold.
      // Both only apply while there is something to scroll.
      tabIndex={scrollable ? 0 : undefined}
      role={scrollable ? 'region' : undefined}
      aria-label={scrollable ? label : undefined}
      // touch-action is what makes the handoff robust: the stage root sets
      // `pinch-zoom` (no single-finger pan), and `pan-y` here overrides it for
      // this subtree only. The decision is made per subtree on the compositor
      // before any JS runs, rather than by a preventDefault that would have to
      // guess on the first touchmove which one owns the gesture.
      className="h-full overflow-y-auto overscroll-y-contain outline-none [touch-action:pan-y] [-webkit-overflow-scrolling:touch]"
    >
      {/* min-h-full + flex is the other half of .section-fullscreen's `flex: 1`:
          short content grows to exactly one panel (so a docked sheet sits on the
          bottom edge as designed), long content grows past it and this scrolls. */}
      <div className="flex min-h-full flex-col">{children}</div>
    </div>
  )
}
