'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'

// Layout effects warn when run during SSR; fall back to useEffect on the server
// (where it's a no-op anyway) so the once-per-session reconcile stays warning-free.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// Drives the full-screen preloader overlay. Returns `loading` which flips to
// false after `duration` ms, choreographing the exit into the hero entrance.
export function usePreloader(duration = 2200) {
  // Play the preloader only once per session — returning from a project page (or
  // a refresh within the tab) shouldn't replay it. `loading` must start `true` on
  // both the server and the first client render (sessionStorage is client-only, so
  // seeding from it during render breaks hydration). We reconcile the skip in a
  // layout effect below — it runs before paint, so a return visit never flashes
  // the overlay, and `instant` suppresses its exit animation on that path.
  const [loading, setLoading] = useState(true)
  const instantRef = useRef(false)

  useIsomorphicLayoutEffect(() => {
    let seen = false
    try {
      seen = !!sessionStorage.getItem('ss-preloaded')
    } catch {}

    // Return visit: drop the overlay before paint, with no exit animation.
    if (seen) {
      instantRef.current = true
      setLoading(false)
      return
    }

    // First visit: play it through, then remember for the rest of the session.
    const timer = setTimeout(() => {
      setLoading(false)
      try {
        sessionStorage.setItem('ss-preloaded', '1')
      } catch {}
    }, duration)
    return () => clearTimeout(timer)
  }, [duration])

  // Lock body scroll while the preloader is visible.
  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [loading])

  return { loading, instant: instantRef.current }
}
