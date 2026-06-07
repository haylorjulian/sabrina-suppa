'use client'

import { useState, useEffect } from 'react'

// SSR-safe media query hook. Returns false on the server / first paint, then
// resolves on mount.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const update = () => setMatches(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [query])

  return matches
}
