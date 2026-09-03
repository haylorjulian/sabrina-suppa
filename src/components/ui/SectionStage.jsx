'use client'

import { Children, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Observer } from 'gsap/Observer'
import { useNavTheme } from '@/components/NavThemeProvider'
import { peekSectionTarget } from '@/lib/sectionTarget'
import { acquireScrollLock } from '@/lib/scrollLock'
import PanelScroll from '@/components/ui/PanelScroll'

// The site's one section engine, at every tier.
//
// The page does not scroll. Panels are stacked in a fixed root and a GSAP
// Observer turns wheel/touch into an index change, which a timeline animates.
// That is the whole point: with no scrollport there is no scroll position to be
// wrong, no snap point to be arrested on, and no `scrollHeight - innerHeight`
// boundary moving underneath a jump as iOS Safari's URL bar retracts. Those
// three were what made the mobile nav land on the wrong section intermittently —
// five uncoordinated mechanisms all writing scroll position, scroll-snap-type
// and document height at once. Navigation is now `goTo(index)`: no measurement,
// no timing, nothing to race.
//
// Motion is ported from GSAP's "Animated Continuous Sections" pen
// (codepen.io/GreenSock/pen/XWzRraJ): the incoming panel's clip window wipes in
// from the direction of travel while its content counter-slides to stay put, and
// both panels' contents drift against each other by PARALLAX. Its `SplitText`
// heading stagger and its `wrap` (which looped last → first) are deliberately
// not ported — see DESIGN.md on busy maximalism, and a portfolio with a nav must
// not wrap Connect back to Home.
//
// Exported: the Nav fades its bar in/out against this same transition.
export const DURATION = 1.25 // seconds, panel to panel
const COOLDOWN = 250 // ms after a transition before the next trigger is accepted
const EASE = 'power1.inOut'
const PARALLAX = 15 // % the panel content drifts against the wipe
const TOLERANCE = 10 // min gesture delta to count, wheel or touch
const EDGE_DWELL = 400 // ms of quiet on an inner scroller before it hands the gesture back

// Layout effects warn during SSR; fall back to useEffect on the server (a no-op
// there) so the pre-paint seed stays warning-free.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// Registered lazily, never at module scope: `output: 'export'` renders this
// module in Node at build time, and registerPlugin has no business running there.
let registered = false
function registerOnce() {
  if (registered) return
  gsap.registerPlugin(Observer)
  registered = true
}

export default function SectionStage({ media, panels, disabled = false, children }) {
  const items = Children.toArray(children)
  const { setTheme, setSection } = useNavTheme()

  // Start on the first panel: the server and the first client render must agree,
  // and the incoming #hash is client-only. The layout effect below reconciles it
  // before paint, so "Back to work" lands directly on Work with no Hero flash and
  // no hydration mismatch.
  const [index, setIndex] = useState(0)
  const indexRef = useRef(0)
  const lockedRef = useRef(false)
  const reducedRef = useRef(false)
  const disabledRef = useRef(disabled)
  const lastInnerScrollAt = useRef(0)

  const rootRef = useRef(null)
  const panelRefs = useRef([])
  const outerRefs = useRef([])
  const innerRefs = useRef([])
  const bgRefs = useRef([])
  const tlRef = useRef(null)

  useEffect(() => {
    disabledRef.current = disabled
  }, [disabled])

  // The transition itself. `from` is -1 on the very first application.
  const applyIndex = useCallback((to, from, instant) => {
    const panelEls = panelRefs.current
    const outers = outerRefs.current
    const inners = innerRefs.current
    const bgs = bgRefs.current
    if (!panelEls[to]) return

    tlRef.current?.kill()
    tlRef.current = null

    // +1 travelling forward (down the list), -1 back.
    const d = to >= from ? 1 : -1

    if (instant) {
      panelEls.forEach((el, i) => {
        if (el) gsap.set(el, { autoAlpha: i === to ? 1 : 0, zIndex: i === to ? 1 : 0 })
      })
      gsap.set([outers[to], inners[to], bgs[to]].filter(Boolean), { yPercent: 0 })
      return
    }

    const tl = gsap.timeline({ defaults: { duration: DURATION, ease: EASE } })
    tlRef.current = tl

    if (from >= 0 && from !== to && panelEls[from]) {
      // Drops behind the incoming panel for the whole crossing, then goes fully
      // hidden — `autoAlpha`, so it leaves the accessibility tree and find-in-page
      // rather than lingering as a transparent full-screen section.
      gsap.set(panelEls[from], { zIndex: 0 })
      tl.to(bgs[from], { yPercent: -PARALLAX * d }).set(panelEls[from], { autoAlpha: 0 })
    }

    gsap.set(panelEls[to], { autoAlpha: 1, zIndex: 1 })
    tl.fromTo(
      [outers[to], inners[to]],
      // The clip window arrives from the direction of travel; the content inside
      // it starts equally displaced the other way, so it holds still in the
      // viewport while the window uncovers it.
      { yPercent: (i) => (i ? -100 * d : 100 * d) },
      { yPercent: 0 },
      0
    ).fromTo(bgs[to], { yPercent: PARALLAX * d }, { yPercent: 0 }, 0)
  }, [])

  // `silent` suppresses the hash write: for a seed, a watchdog re-assert or a
  // hashchange, the URL is the input, not the output.
  const goTo = useCallback(
    (target, { force = false, instant = false, silent = false } = {}) => {
      const clamped = Math.max(0, Math.min(panels.length - 1, target))
      if (clamped === indexRef.current) return
      if (lockedRef.current && !force) return

      const from = indexRef.current
      const quick = instant || reducedRef.current
      lockedRef.current = true
      indexRef.current = clamped
      applyIndex(clamped, from, quick)
      setIndex(clamped)

      // The hash is written HERE and nowhere else — an actual move is the only
      // thing that may touch it. It used to be written from the effect that
      // syncs the nav theme, guarded by a "skip the first commit" ref, and that
      // was wrong in a way worth recording: React StrictMode double-invokes
      // passive effects, so the guard was consumed by the first invocation and
      // the replay — still closed over index 0 — wrote #home over an incoming
      // /#about. engage() then read that clobbered hash back and pulled the
      // stage to the first panel. A deep link landed on the wrong section, which
      // is the exact bug class this component exists to remove.
      const hash = panels[clamped]?.hash
      if (!silent && hash && window.location.hash.slice(1) !== hash) {
        history.replaceState(null, '', `#${hash}`)
      }

      // Instant jumps don't animate, so they don't hold the input lock for the
      // length of an animation that isn't running.
      window.setTimeout(() => {
        lockedRef.current = false
      }, (quick ? 0 : DURATION) * 1000 + COOLDOWN)
    },
    [panels, applyIndex]
  )

  // Seed the starting panel before paint. A client navigation stashes its target
  // synchronously at click time (see sectionTarget) — reliable, unlike the URL
  // hash, which Next applies a frame late and without a `hashchange` event. Fall
  // back to the hash for full-page deep links (a bookmarked /#work).
  useIsomorphicLayoutEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const target = peekSectionTarget() ?? window.location.hash.replace('#', '')
    const i = panels.findIndex((p) => p.hash === target)
    const start = i > 0 ? i : 0
    indexRef.current = start
    applyIndex(start, -1, true) // instant: the preloader owns the entrance, not this
    if (start !== 0) setIndex(start)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Settle watchdog: for ~1.2s after mount, re-assert the seeded panel if the
  // stage is still (or back) on the first one while a target is pending. This
  // catches every lifecycle crack at once — a StrictMode effect replay, Next
  // committing the URL after our mount effects, or a remount that missed the
  // seed. It only ever corrects 0 → target, and input is locked for longer than
  // this window after any move, so it can never fight a deliberate gesture.
  useEffect(() => {
    let raf
    const deadline = performance.now() + 1200
    const tick = () => {
      const target = peekSectionTarget() ?? window.location.hash.replace('#', '')
      const i = panels.findIndex((p) => p.hash === target)
      if (i > 0 && indexRef.current === 0) goTo(i, { force: true, instant: true, silent: true })
      if (performance.now() < deadline) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the nav theme in step with the active panel. Only the engaged tier
  // writes: the other stage is display:none behind a CSS breakpoint and must not
  // touch shared state. Idempotent on purpose — it may run more than once per
  // commit (StrictMode replays passive effects) and setting the same value bails
  // out of the render, so a replay costs nothing and changes nothing. The hash
  // is deliberately NOT written here; see goTo.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia(media).matches) return
    const panel = panels[index]
    if (!panel) return
    setTheme(panel.theme)
    setSection(panel.hash)
  }, [index, panels, media, setTheme, setSection])

  // Input. Engages and disengages live as the viewport crosses the breakpoint;
  // the two stages' queries partition, so exactly one is ever engaged.
  useEffect(() => {
    registerOnce()
    const mql = window.matchMedia(media)
    const root = rootRef.current
    let engaged = false
    let observer = null
    let releaseLock = null

    // A zoomed-in reader must be able to pan. touch-action: pinch-zoom permits
    // the pinch but not the pan that follows it, so hand the viewport back
    // outright while scale > 1 and stop advancing panels under their finger.
    const zoomed = () => (window.visualViewport?.scale ?? 1) > 1.01

    // Does this gesture belong to a scroll region inside the active panel rather
    // than to the stage?
    const shouldIgnore = (dir, e) => {
      if (zoomed()) return true
      const el = e?.target?.closest?.('[data-panel-scroll]')
      if (!el) return false
      const panel = panelRefs.current[indexRef.current]
      if (!panel || !panel.contains(el)) return false
      const max = el.scrollHeight - el.clientHeight
      if (max <= 1) return false // content fits — the region is inert, the stage owns this
      const atEnd = dir > 0 ? el.scrollTop >= max - 1 : el.scrollTop <= 1
      if (!atEnd) return true // it can still scroll, so the stage stands down entirely
      // It is at the end, but the flick that brought it here is probably still
      // running. Without this dwell the same gesture would scroll the copy to its
      // last line and advance the panel in one motion.
      return performance.now() - lastInnerScrollAt.current < EDGE_DWELL
    }

    const onInnerScroll = (e) => {
      if (e.target?.matches?.('[data-panel-scroll]')) lastInnerScrollAt.current = performance.now()
    }

    const onKey = (e) => {
      if (disabledRef.current) return
      const forward = ['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key)
      const back = ['ArrowUp', 'PageUp'].includes(e.key)
      if (!forward && !back) return
      // Let the browser scroll a focused region that still has somewhere to go.
      const el = document.activeElement?.closest?.('[data-panel-scroll]')
      if (el) {
        const max = el.scrollHeight - el.clientHeight
        if (max > 1 && (forward ? el.scrollTop < max - 1 : el.scrollTop > 1)) return
      }
      e.preventDefault()
      goTo(indexRef.current + (forward ? 1 : -1))
    }

    const onHash = ({ instant = false } = {}) => {
      const id = window.location.hash.replace('#', '')
      const i = panels.findIndex((p) => p.hash === id)
      if (i >= 0) goTo(i, { force: true, instant, silent: true })
    }

    // The page cannot scroll, so in-page #section links can't move it on their
    // own — drive the stage directly on click. Never gated on `disabled`: the
    // mobile menu's own links are exactly these, and they fire while it is open.
    const onClick = (e) => {
      const a = e.target.closest?.('a[href^="#"]')
      if (!a) return
      const id = a.getAttribute('href').slice(1)
      const i = panels.findIndex((p) => p.hash === id)
      if (i < 0) return
      e.preventDefault()
      goTo(i, { force: true })
    }

    const engage = () => {
      if (engaged || !root) return
      engaged = true
      releaseLock = acquireScrollLock()
      observer = Observer.create({
        // The stage root, never window. The mobile menu overlay and the preloader
        // are fixed siblings *outside* this subtree, so their gestures cannot
        // reach the observer by construction — no enable/disable state machine to
        // fall out of step, which is the class of bug being fixed here.
        target: root,
        type: 'wheel,touch',
        wheelSpeed: -1, // so onUp/onDown agree between a wheel and a finger
        tolerance: TOLERANCE,
        dragMinimum: TOLERANCE,
        // The pen sets this true. Here `touch-action` does the blocking instead
        // (see .stage-root and PanelScroll): it decides per subtree, on the
        // compositor, before any JS runs — rather than asking a handler to guess
        // on the first touchmove whether an inner scroller owns the gesture.
        preventDefault: false,
        // Observer's naming is the viewport's, not the list's: dragging the
        // content up means moving forward through the panels.
        onUp: (self) => {
          if (!shouldIgnore(1, self.event)) goTo(indexRef.current + 1)
        },
        onDown: (self) => {
          if (!shouldIgnore(-1, self.event)) goTo(indexRef.current - 1)
        },
      })
      // Capture: scroll doesn't bubble.
      root.addEventListener('scroll', onInnerScroll, true)
      window.addEventListener('keydown', onKey)
      window.addEventListener('hashchange', onHash)
      document.addEventListener('click', onClick)
      const panel = panels[indexRef.current]
      if (panel) {
        setTheme(panel.theme)
        setSection(panel.hash)
      }
      onHash({ instant: true }) // honour an initial #section, without animating
    }

    const disengage = () => {
      if (!engaged) return
      engaged = false
      observer?.kill()
      observer = null
      root?.removeEventListener('scroll', onInnerScroll, true)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('hashchange', onHash)
      document.removeEventListener('click', onClick)
      releaseLock?.()
      releaseLock = null
      // Deliberately sets no theme. The partner stage's own sync() runs on this
      // same matchMedia event and sets its values; a disengage that writes
      // nothing can never stomp what the other tier has just decided.
    }

    const sync = () => (mql.matches ? engage() : disengage())
    sync()
    mql.addEventListener('change', sync)

    return () => {
      mql.removeEventListener('change', sync)
      disengage()
      tlRef.current?.kill()
    }
  }, [goTo, panels, media, setTheme, setSection])

  return (
    <div ref={rootRef} className="stage-root">
      {items.map((child, i) => (
        <div
          key={panels[i]?.key ?? i}
          ref={(node) => (panelRefs.current[i] = node)}
          className="stage-panel"
        >
          {/* The pen's two clip wrappers: `outer` is the window that travels,
              `inner` carries the content the opposite way so it holds still. */}
          <div ref={(node) => (outerRefs.current[i] = node)} className="stage-clip">
            <div ref={(node) => (innerRefs.current[i] = node)} className="stage-clip">
              <div ref={(node) => (bgRefs.current[i] = node)} className="h-full w-full">
                <PanelScroll active={i === index} label={panels[i]?.label}>
                  {child}
                </PanelScroll>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
