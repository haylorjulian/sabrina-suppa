'use client'

import { Children, useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavTheme } from '@/components/NavThemeProvider'

const DURATION = 1.5 // seconds, section-to-section crossfade
const COOLDOWN = 250 // ms after a fade before the next trigger is accepted
const THRESHOLD = 12 // min |deltaY| to count as a scroll gesture
const EASE = [0.4, 0, 0.2, 1]

// Triggered slideshow: the home sections (which each fit one viewport) are
// stacked and crossfade one at a time. A small scroll or key press auto-plays the
// fade to the next section over a fixed duration; input is locked until it
// finishes. Native page scroll is taken over while mounted. Owns the nav colour
// theme and keeps the URL hash in sync so the nav links still work.
export default function ScrollStage({ children, themes = [], ids = [] }) {
  const items = Children.toArray(children)
  const n = items.length
  const { setTheme } = useNavTheme()

  // Seed the starting section from an incoming #hash during render (e.g. "Back to
  // work" → /#work) so the stage's first paint is already on that section — no
  // Hero flash, and no dependence on post-mount effect timing.
  const [index, setIndex] = useState(() => {
    if (typeof window === 'undefined') return 0
    const i = ids.indexOf(window.location.hash.replace('#', ''))
    return i > 0 ? i : 0
  })
  const indexRef = useRef(index)
  const lockedRef = useRef(false)
  const reducedRef = useRef(false)

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

  // Keep the URL hash + nav theme in sync with the active section. The starting
  // section (incl. an incoming #hash) is seeded in the useState initializer above.
  useEffect(() => {
    if (ids[index]) history.replaceState(null, '', `#${ids[index]}`)
    if (themes[index]) setTheme(themes[index])
  }, [index, ids, themes, setTheme])

  // Input handling + hash navigation. Listeners attached once.
  useEffect(() => {
    reducedRef.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    // Take over native scroll; restore on unmount (e.g. navigating to a gallery).
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

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

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('hashchange', onHash)
    document.addEventListener('click', onClick)
    onHash() // honour an initial #section in the URL

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('hashchange', onHash)
      document.removeEventListener('click', onClick)
      document.body.style.overflow = prevOverflow
    }
  }, [goTo, ids])

  return (
    <div className="relative h-[100svh] w-full overflow-hidden">
      {items.map((child, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: reducedRef.current ? 0 : DURATION, ease: EASE }}
          style={{ zIndex: i === index ? 2 : 1, pointerEvents: i === index ? 'auto' : 'none' }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
