'use client'

import { useEffect } from 'react'

const DESKTOP = '(min-width: 1024px)' // mirrors ScrollStage — the tier that owns the sections

// A scroll is settled once no scroll event has fired for this long. iOS momentum
// keeps firing well past touchend, so touchend is far too early to measure from.
const IDLE_MS = 100

// Far enough from the end that changing the document's height cannot disturb the
// scroll position — nothing is being clamped this far up.
const SAFE_DISTANCE = 200

// ── The approach tail, present only while Connect is being approached ────────
//
// Connect is the last mobile section, so its snap point is the document's
// maximum scroll offset. Measured on iOS Safari 26.5 (iPhone 17 Pro simulator,
// scrollHeight 3770, snap point 3016): a finger-flick from About decelerates
// smoothly to 2958 — 58px short — sits there for ~120ms, and only then does
// Safari apply the snap, moving the page 58px in a single frame. That is the
// lurch. Safari's fling animation aims at a snap point when it can (the three
// landings above Connect converge onto theirs exactly, every time) but it will
// not aim at one that sits at the very end of the scroll range, so the last
// section gets a discrete correction instead of a smooth arrival.
//
// Trailing scroll room past the snap point fixes that — measured across the
// range, the correction falls 58px → 18px at 40px of tail and reaches 0 from
// 60px upward. But room to aim at is also room to travel into: with a static
// tail, a flick made while already resting on Connect runs to the end of the
// tail and is snapped back by exactly the tail's height (a 120px tail produced
// a 121px snap-back). Approach and rest want opposite things from the same
// property.
//
// So the tail is only there while it is needed. It is present whenever the page
// is anywhere but Connect, and removed once the page comes to rest on Connect —
// at which point the document ends exactly at the resting offset, so a further
// flick just rubber-bands and returns, which is what it did before any of this
// existed. Removing it at rest cannot move the page: the scroll position is
// already the new maximum.
//
// Safari-only, below lg only. Safari is the one engine that both resizes its
// layout viewport for the chrome and declines to aim a fling at a boundary snap
// point; Chrome and Firefox on iOS land the last section correctly unaided, and
// the CSS collapses the tail to zero for them anyway.
export default function ConnectApproachTail() {
  useEffect(() => {
    // Set by the inline script in layout.jsx before first paint. Desktop Safari
    // carries it too, hence the tier check — there the tail computes to 0.
    if (document.documentElement.getAttribute('data-browser') !== 'safari') return
    if (window.matchMedia(DESKTOP).matches) return

    const html = document.documentElement
    let idleTimer = null
    let present = null // tri-state: null until first decision

    const setTail = (want) => {
      if (want === present) return
      present = want
      // Empty string drops the override so the stylesheet's own value applies.
      html.style.setProperty('--connect-tail', want ? '' : '0px')
    }

    const connectTop = () => {
      const el = document.getElementById('connect')
      return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null
    }

    const settled = () => {
      const top = connectTop()
      if (top === null) return
      // Keyed on DISTANCE, not on alignment. Testing "is it resting exactly on
      // Connect" put the tail back whenever the page came to rest slightly past
      // the snap point, which is a resting place the moving chrome can produce —
      // and that handed the next flick the whole tail to travel into. Anywhere
      // at or near the end, the approach is over and the tail should be gone.
      setTail(window.scrollY < top - SAFE_DISTANCE)
    }

    const onScroll = () => {
      const top = connectTop()
      // Restore the tail as soon as the page is far enough from the end that
      // growing the document cannot move anything. Doing it here as well as on
      // settle covers a reader who scrolls up and flicks back down without ever
      // pausing long enough for the idle timer.
      if (top !== null && window.scrollY < top - SAFE_DISTANCE) setTail(true)

      window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(settled, IDLE_MS)
    }

    // Passive: this only observes, it never blocks a gesture.
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scrollend', settled, { passive: true })
    settled()

    return () => {
      window.clearTimeout(idleTimer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scrollend', settled)
      html.style.removeProperty('--connect-tail')
    }
  }, [])

  return null
}
