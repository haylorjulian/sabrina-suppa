'use client'

import { useState, useEffect } from 'react'

// Drives the full-screen preloader overlay. Returns `loading` which flips to
// false after `duration` ms, choreographing the exit into the hero entrance.
export function usePreloader(duration = 2200) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Play the preloader only once per session — returning from a project page
    // (or a refresh within the tab) shouldn't replay it.
    if (typeof window !== 'undefined' && sessionStorage.getItem('ss-preloaded')) {
      setLoading(false)
      return
    }
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

  return { loading }
}
