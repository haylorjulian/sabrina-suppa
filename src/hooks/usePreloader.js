'use client'

import { useState, useEffect } from 'react'

// Drives the full-screen preloader overlay. Returns `loading` which flips to
// false after `duration` ms, choreographing the exit into the hero entrance.
export function usePreloader(duration = 2200) {
  // Play the preloader only once per session — returning from a project page (or
  // a refresh within the tab) shouldn't replay it. Seed the skip during render
  // (like ScrollStage's index) so a return visit never paints the overlay; doing
  // this in an effect would flash it for one frame before hiding it.
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      return !sessionStorage.getItem('ss-preloaded')
    } catch {
      return true
    }
  })

  useEffect(() => {
    if (!loading) return
    const timer = setTimeout(() => {
      setLoading(false)
      try {
        sessionStorage.setItem('ss-preloaded', '1')
      } catch {}
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, loading])

  // Lock body scroll while the preloader is visible.
  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [loading])

  return { loading }
}
