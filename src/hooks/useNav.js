'use client'

import { useState, useCallback } from 'react'

// Mobile menu open/close state for the navigation overlay.
export function useNav() {
  const [open, setOpen] = useState(false)

  const toggleMenu = useCallback(() => setOpen((p) => !p), [])
  const closeMenu = useCallback(() => setOpen(false), [])

  return { open, toggleMenu, closeMenu }
}
