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
// The page does not scroll. Panels live in a fixed root and a GSAP Observer turns
// wheel/touch into an index change. That is the whole point: with no scrollport
// there is no scroll position to be wrong, no snap point to be arrested on, and
// no `scrollHeight - innerHeight` boundary moving underneath a jump as iOS
// Safari's URL bar retracts. Those three were what made the mobile nav land on
// the wrong section intermittently — five uncoordinated mechanisms all writing
// scroll position, scroll-snap-type and document height at once. Navigation is
// `goTo(index)`: no measurement, no timing, nothing to race.
//
// Two transitions, chosen per tier by the `transition` prop. Everything else —
// input, seeding, the hash, the nav theme, the keyboard, the inner-scroller
// handoff — is shared, so the tiers differ in what you see and in nothing else.
//
//   'fade'  (desktop) — a dissolve *through the ground* on `autoAlpha`, GSAP
//     core's alias for opacity + visibility. Both panels animate over the full
//     second with opposed eases so they do NOT overlap: the outgoing leaves early
//     (power2.out) and the incoming arrives late (power2.in), and in between the
//     graphite ground carries the crossing. That is DESIGN.md's stated signature
//     ("adjacent sections dissolve through the dark ground"), and it also avoids
//     a real legibility problem: every panel puts a heading and a paragraph in
//     the same place, so a true cross-dissolve superimposes two of each and
//     neither is readable for about half a second.
//
//   'snap'  (mobile) — the panels are a vertical track that follows the finger
//     and settles on a section boundary when it is released. See DRAG below.
//
// Exported: the Nav fades its bar in/out against the desktop transition.
export const DURATION = 1 // seconds, the fade
const EASE_OUT = 'power2.out' // fade, outgoing: leaves early
const EASE_IN = 'power2.in' // fade, incoming: arrives late

// ── DRAG ────────────────────────────────────────────────────────────────────
// The mobile track follows the finger 1:1 and snaps on release. Observer already
// reports the gesture lifecycle (onDragStart/onDrag/onDragEnd) with a movement
// threshold, so no second input system is needed — which matters more here than
// the physics does: the inner-scroller handoff (shouldIgnore, below) only works
// because one thing reads every gesture. GSAP's Draggable + InertiaPlugin is the
// obvious alternative and both ship free now, but Inertia's value is plotting a
// natural landing position, and a strict one-section-per-gesture rule throws that
// away — GreenSock's own Draggable snap demo discards it the same way.
//
// Position is read from the raw touch rather than Observer's deltas so the sign
// convention is unambiguous: screen coordinates, finger up = negative offset =
// the track rises = the next panel arrives.
const SNAP_DURATION = 0.5 // seconds to settle after release — a drag wants to land, not glide
const SNAP_EASE = 'power2.out'
const COMMIT_RATIO = 0.18 // fraction of the panel dragged past which the move commits
const FLICK_VELOCITY = 450 // px/s — a short fast flick commits without reaching COMMIT_RATIO
const EDGE_RESISTANCE = 0.35 // rubber-band factor when dragging past the first/last panel
const COOLDOWN = 250 // ms after a transition before the next trigger is accepted
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

// Pointer y from whichever event shape arrived.
const pointerY = (e) =>
  e?.touches?.[0]?.clientY ?? e?.changedTouches?.[0]?.clientY ?? e?.clientY ?? null

export default function SectionStage({ media, panels, transition = 'fade', disabled = false, children }) {
  const items = Children.toArray(children)
  const { setTheme, setSection } = useNavTheme()
  const snap = transition === 'snap'

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
  const tlRef = useRef(null)
  // The track is virtual: a single offset that every panel is positioned from.
  // It was a real DOM element wrapping the panels, and iOS Safari would not place
  // it where it was told — `position: absolute; top: 0` inside a `position: fixed`
  // root, with `offsetTop` reporting 0 and the root's own rect at 0, still painted
  // one whole panel high (measured on the simulator: getBoundingClientRect and
  // offsetTop disagreeing by exactly 714px, and the rendering following the rect).
  // Every panel was then off by one, which is what showed Connect while the stage
  // believed it was on About. Panels are now plain `inset: 0` boxes — the same
  // ones the fade tier has always rendered correctly — moved only by transform,
  // so there is no containing block left to disagree about.
  const trackY = useRef(0)

  useEffect(() => {
    disabledRef.current = disabled
  }, [disabled])

  // One panel's height. Everything about the track is expressed in these.
  const panelHeight = useCallback(() => rootRef.current?.clientHeight ?? 0, [])

  // Which panels may be seen. In fade mode only the active one; in snap mode its
  // neighbours too, since a drag brings one of them into view before the index
  // changes. Everything else is autoAlpha 0 — hidden, so it also leaves the
  // accessibility tree and find-in-page rather than lingering off-screen.
  const showWindow = useCallback(
    (active) => {
      panelRefs.current.forEach((el, i) => {
        if (!el) return
        const near = snap ? Math.abs(i - active) <= 1 : i === active
        gsap.set(el, { autoAlpha: near ? 1 : 0 })
      })
    },
    [snap]
  )

  // Lay every panel out from the virtual track offset. Five `gsap.set` calls a
  // frame is nothing, and it buys a layout that cannot be misplaced.
  const renderTrack = useCallback(() => {
    const h = panelHeight()
    panelRefs.current.forEach((el, i) => {
      if (el) gsap.set(el, { y: i * h + trackY.current })
    })
  }, [panelHeight])

  // The transition itself. `from` is -1 on the very first application.
  const applyIndex = useCallback(
    (to, from, instant) => {
      const panelEls = panelRefs.current
      if (!panelEls[to]) return

      tlRef.current?.kill()
      tlRef.current = null

      if (snap) {
        showWindow(to)
        const y = -to * panelHeight()
        // Tweens from wherever the track currently sits, which is what lets a
        // released drag continue smoothly into the settle instead of jumping.
        if (instant) {
          trackY.current = y
          renderTrack()
        } else {
          tlRef.current = gsap.to(trackY, {
            current: y,
            duration: SNAP_DURATION,
            ease: SNAP_EASE,
            onUpdate: renderTrack,
          })
        }
        return
      }

      if (instant) {
        panelEls.forEach((el, i) => {
          if (el) gsap.set(el, { autoAlpha: i === to ? 1 : 0, zIndex: i === to ? 1 : 0 })
        })
        return
      }

      const tl = gsap.timeline()
      tlRef.current = tl

      // Both run the full second, starting together. The opposed eases are what
      // open the gap between them: at the midpoint each sits near 0.1, so the
      // ground carries the crossing rather than either panel.
      if (from >= 0 && from !== to && panelEls[from]) {
        gsap.set(panelEls[from], { zIndex: 0 })
        tl.to(panelEls[from], { autoAlpha: 0, duration: DURATION, ease: EASE_OUT }, 0)
      }

      gsap.set(panelEls[to], { zIndex: 1 })
      tl.fromTo(panelEls[to], { autoAlpha: 0 }, { autoAlpha: 1, duration: DURATION, ease: EASE_IN }, 0)
    },
    [snap, showWindow, panelHeight, renderTrack]
  )

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
      const seconds = quick ? 0 : snap ? SNAP_DURATION : DURATION
      window.setTimeout(() => {
        lockedRef.current = false
      }, seconds * 1000 + COOLDOWN)
    },
    [panels, applyIndex, snap]
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

    // ── the drag, snap tier only ───────────────────────────────────────────
    let dragging = false
    let dragFrom = 0
    let dragStartY = 0
    let dragOffset = 0
    // True while this gesture is the stage's rather than an inner scroller's.
    // Decided at touchstart from whether the touch landed in a region that has
    // anywhere to scroll, and refined by onDragStart once the direction is known.
    let ownsGesture = false

    // Safari treats a downward drag as a request to show its toolbars, and
    // showing them resizes the viewport. That lands mid-transition, and the
    // resize handler below then re-places the track for the new panel height —
    // which reads as the section changing instantly, with no slide at all. It
    // only ever happened going back, because only a downward drag reveals
    // chrome, which is exactly the asymmetry that was reported.
    //
    // Cancelling the moves we own stops Safari acting on them. It is deliberately
    // narrower than the reference implementation's blanket `preventDefault: true`:
    // a gesture that belongs to a panel's scroll region is left alone so it still
    // scrolls natively, and a second finger is always let through so pinch-zoom
    // survives.
    const onTouchStart = (e) => {
      const region = e.target?.closest?.('[data-panel-scroll]')
      const live = region && region.scrollHeight - region.clientHeight > 1
      ownsGesture = !live
    }
    const onTouchMove = (e) => {
      if (e.touches && e.touches.length > 1) return // pinch: hand it back
      if ((ownsGesture || dragging) && e.cancelable) e.preventDefault()
    }
    const onTouchEnd = () => {
      ownsGesture = false
    }

    const settle = (to, from) => {
      // Used when the drag is released without committing: the index has not
      // changed, so goTo would bail out, but the track is still offset.
      showWindow(to)
      tlRef.current?.kill()
      tlRef.current = gsap.to(trackY, {
        current: -to * panelHeight(),
        duration: SNAP_DURATION,
        ease: SNAP_EASE,
        onUpdate: renderTrack,
      })
      void from
    }

    const onDragStart = (self) => {
      if (disabledRef.current || lockedRef.current) return
      const y = pointerY(self.event)
      if (y === null) return
      // Direction is known by now — Observer only starts a drag once it has moved
      // past dragMinimum — so the inner-scroller handoff can use the same test
      // the discrete tiers use. Standing down here means never setting
      // `dragging`, so every later onDrag is a no-op and the browser scrolls the
      // region natively (touch-action: pan-y on it, see PanelScroll).
      const dir = y < dragStartY ? 1 : -1
      if (shouldIgnore(dir, self.event)) {
        ownsGesture = false // the region has somewhere to go; let it scroll
        return
      }
      ownsGesture = true
      tlRef.current?.kill()
      dragging = true
      dragFrom = indexRef.current
      dragOffset = 0
      showWindow(dragFrom)
    }

    const onDrag = (self) => {
      if (!dragging) return
      const y = pointerY(self.event)
      if (y === null) return
      let offset = y - dragStartY

      // Never more than one panel, in either direction: the track is clamped to
      // a single height, so a long drag cannot expose a third panel and a fast
      // one cannot skip. This is the guarantee CSS `scroll-snap-stop: always`
      // was supposed to give and never actually did — Chrome carried fast flings
      // several sections past their stop.
      const h = panelHeight()
      offset = Math.max(-h, Math.min(h, offset))

      // Rubber-band at the two ends rather than letting the track leave the
      // stage — there is nothing beyond Home or Connect to drag into.
      const atStart = dragFrom === 0 && offset > 0
      const atEnd = dragFrom === panels.length - 1 && offset < 0
      if (atStart || atEnd) offset *= EDGE_RESISTANCE

      dragOffset = offset
      trackY.current = -dragFrom * h + offset
      renderTrack()
    }

    const onDragEnd = (self) => {
      if (!dragging) return
      dragging = false
      const h = panelHeight()
      const committed =
        Math.abs(dragOffset) > h * COMMIT_RATIO || Math.abs(self.velocityY ?? 0) > FLICK_VELOCITY
      const dir = dragOffset < 0 ? 1 : -1
      const target = committed ? dragFrom + dir : dragFrom
      if (target === dragFrom || target < 0 || target >= panels.length) settle(dragFrom, dragFrom)
      else goTo(target, { force: true })
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

    // A rotation changes the panel height, so the track's offset has to be
    // re-derived from the new one. Instant: nothing about a resize should read
    // as a transition.
    const onResize = () => {
      if (!snap || dragging) return
      const y = -indexRef.current * panelHeight()
      // Re-target rather than snap. A resize can still arrive mid-transition
      // (a rotation, or browser chrome that got in despite the above), and
      // jumping the track to the new geometry is precisely the instant cut this
      // is meant to avoid — so carry on animating to the corrected position.
      if (tlRef.current?.isActive()) {
        tlRef.current.kill()
        tlRef.current = gsap.to(trackY, {
          current: y,
          duration: SNAP_DURATION,
          ease: SNAP_EASE,
          onUpdate: renderTrack,
          overwrite: true,
        })
      } else {
        trackY.current = y
        renderTrack()
      }
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
        // The reference implementation sets this true. Here `touch-action` does
        // the blocking instead (see .stage-root and PanelScroll): it decides per
        // subtree, on the compositor, before any JS runs — rather than asking a
        // handler to guess on the first touchmove whether an inner scroller owns
        // the gesture.
        preventDefault: false,
        onPress: (self) => {
          dragStartY = pointerY(self.event) ?? 0
        },
        onDragStart: snap ? onDragStart : undefined,
        onDrag: snap ? onDrag : undefined,
        onDragEnd: snap ? onDragEnd : undefined,
        // Observer's naming is the viewport's, not the list's: moving the content
        // up means moving forward through the panels. On the snap tier the finger
        // is handled by the drag callbacks above, so these are left to the wheel
        // alone — a trackpad in a narrow window still gets a discrete advance.
        onUp: (self) => {
          if (snap && self.event?.type !== 'wheel') return
          if (!shouldIgnore(1, self.event)) goTo(indexRef.current + 1)
        },
        onDown: (self) => {
          if (snap && self.event?.type !== 'wheel') return
          if (!shouldIgnore(-1, self.event)) goTo(indexRef.current - 1)
        },
      })
      if (snap) {
        root.addEventListener('touchstart', onTouchStart, { passive: true })
        root.addEventListener('touchmove', onTouchMove, { passive: false })
        root.addEventListener('touchend', onTouchEnd, { passive: true })
        root.addEventListener('touchcancel', onTouchEnd, { passive: true })
      }
      // Capture: scroll doesn't bubble.
      root.addEventListener('scroll', onInnerScroll, true)
      window.addEventListener('keydown', onKey)
      window.addEventListener('hashchange', onHash)
      window.addEventListener('resize', onResize)
      document.addEventListener('click', onClick)
      const panel = panels[indexRef.current]
      if (panel) {
        setTheme(panel.theme)
        setSection(panel.hash)
      }
      onResize() // the track's height was unknown while the tier was display:none
      onHash({ instant: true }) // honour an initial #section, without animating
    }

    const disengage = () => {
      if (!engaged) return
      engaged = false
      dragging = false
      observer?.kill()
      observer = null
      root?.removeEventListener('touchstart', onTouchStart)
      root?.removeEventListener('touchmove', onTouchMove)
      root?.removeEventListener('touchend', onTouchEnd)
      root?.removeEventListener('touchcancel', onTouchEnd)
      root?.removeEventListener('scroll', onInnerScroll, true)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('resize', onResize)
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
  }, [goTo, panels, media, setTheme, setSection, snap, showWindow, panelHeight, renderTrack])

  return (
    <div ref={rootRef} className="stage-root">
      {items.map((child, i) => (
        <div
          key={panels[i]?.key ?? i}
          ref={(node) => (panelRefs.current[i] = node)}
          className="stage-panel"
          // The fade tier gets this for free from `autoAlpha` — a panel at
          // opacity 0 is also `visibility: hidden`, so it leaves the
          // accessibility tree and find-in-page. The snap tier cannot: its
          // neighbours are deliberately visible so one can be dragged into view,
          // which would otherwise put two off-screen sections back into the
          // reading order. Marked explicitly instead, at both tiers so the rule
          // is one rule: only the panel on stage is reachable.
          aria-hidden={i === index ? undefined : 'true'}
          inert={i === index ? undefined : ''}
        >
          <PanelScroll active={i === index} label={panels[i]?.label}>
            {child}
          </PanelScroll>
        </div>
      ))}
    </div>
  )
}
