'use client'

import { Children, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavTheme } from '@/components/NavThemeProvider'

const DURATION = 1.5 // seconds, section-to-section crossfade
const COOLDOWN = 250 // ms after a fade before the next trigger is accepted
const THRESHOLD = 12 // min |deltaY| to count as a scroll gesture
const EASE = [0.4, 0, 0.2, 1]
const DESKTOP = '(min-width: 1024px)' // the slideshow only runs at the desktop tier

// Layout effects warn during SSR; fall back to useEffect on the server (a no-op
// there) so the hash-seed reconcile below stays warning-free.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// Triggered slideshow: the home sections (which each fit one viewport) are
// stacked and crossfade one at a time. A small scroll or key press auto-plays the
// fade to the next section over a fixed duration; input is locked until it
// finishes. Native page scroll is taken over while mounted. Owns the nav colour
// theme and keeps the URL hash in sync so the nav links still work.
export default function ScrollStage({ children, themes = [], ids = [] }) {
  const items = Children.toArray(children)
  const n = items.length
  const { setTheme } = useNavTheme()

  // Start on the first section: the server and the first client render must agree,
  // and the incoming #hash is client-only. We reconcile it in the layout effect
  // below, which runs before paint — so "Back to work" (→ /#work) still lands
  // directly on that section with no Hero flash and no hydration mismatch.
  const [index, setIndex] = useState(0)
  const indexRef = useRef(0)
  const lockedRef = useRef(false)
  const reducedRef = useRef(false)
  const instantRef = useRef(false) // true only for the pre-paint hash seed, so it doesn't crossfade

  // Jump straight to an incoming #hash section on mount, before the browser
  // paints, without animating the transition.
  useIsomorphicLayoutEffect(() => {
    const i = ids.indexOf(window.location.hash.replace('#', ''))
    if (i > 0) {
      instantRef.current = true
      indexRef.current = i
      setIndex(i)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-enable the crossfade once the instant hash seed has committed.
  useEffect(() => {
    instantRef.current = false
  }, [index])

  const goTo = useCallback(
    (target, { force = false } = {}) => {
      const clamped = Math.max(0, Math.min(n - 1, target))
      if (clamped === indexRef.current) return
      if (lockedRef.current && !force) return
      lockedRef.current = true
      indexRef.current = clamped
      setIndex(clamped)
      const dur = reducedRef.current ? 0 : DURATION
      window.setTimeout(() => {
        lockedRef.current = false
      }, dur * 1000 + COOLDOWN)
    },
    [n]
  )

  // Keep the URL hash + nav theme in sync with the active section — desktop only.
  // Below lg the stage is inert (mobile uses natural scroll + a dark nav), so we
  // don't touch the hash or the nav theme there. The starting section (incl. an
  // incoming #hash) is seeded in the useState initializer above.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia(DESKTOP).matches) return
    if (ids[index]) history.replaceState(null, '', `#${ids[index]}`)
    if (themes[index]) setTheme(themes[index])
  }, [index, ids, themes, setTheme])

  // Input handling + hash navigation. Only the desktop tier takes over native
  // scroll; below lg this stays disengaged so the page scrolls normally on touch.
  // Engages/disengages live as the viewport crosses the lg breakpoint.
  useEffect(() => {
    reducedRef.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const mql = window.matchMedia(DESKTOP)

    const next = () => goTo(indexRef.current + 1)
    const prev = () => goTo(indexRef.current - 1)

    const onWheel = (e) => {
      e.preventDefault()
      if (lockedRef.current) return
      if (Math.abs(e.deltaY) < THRESHOLD) return
      e.deltaY > 0 ? next() : prev()
    }

    const onKey = (e) => {
      if (['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key)) {
        e.preventDefault()
        next()
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        prev()
      }
    }

    const onHash = () => {
      const id = window.location.hash.replace('#', '')
      const i = ids.indexOf(id)
      if (i >= 0) goTo(i, { force: true })
    }

    // Native scroll is disabled, so in-page #section links (the nav) can't move
    // the page on their own — drive the stage directly on click.
    const onClick = (e) => {
      const a = e.target.closest?.('a[href^="#"]')
      if (!a) return
      const id = a.getAttribute('href').slice(1)
      const i = ids.indexOf(id)
      if (i < 0) return
      e.preventDefault()
      goTo(i, { force: true })
      history.replaceState(null, '', `#${id}`)
    }

    let engaged = false
    const engage = () => {
      if (engaged) return
      engaged = true
      document.body.style.overflow = 'hidden'
      window.addEventListener('wheel', onWheel, { passive: false })
      window.addEventListener('keydown', onKey)
      window.addEventListener('hashchange', onHash)
      document.addEventListener('click', onClick)
      if (themes[indexRef.current]) setTheme(themes[indexRef.current])
      onHash() // honour an initial #section in the URL
    }
    const disengage = () => {
      if (!engaged) return
      engaged = false
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('hashchange', onHash)
      document.removeEventListener('click', onClick)
      document.body.style.overflow = ''
      setTheme('dark') // mobile sections are dark full-bleed imagery
    }

    const sync = () => (mql.matches ? engage() : disengage())
    sync()
    mql.addEventListener('change', sync)

    return () => {
      mql.removeEventListener('change', sync)
      disengage()
    }
  }, [goTo, ids, themes, setTheme])

  return (
    <div className="relative h-[100svh] w-full overflow-hidden">
      {items.map((child, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: instantRef.current || reducedRef.current ? 0 : DURATION, ease: EASE }}
          style={{ zIndex: i === index ? 2 : 1, pointerEvents: i === index ? 'auto' : 'none' }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
