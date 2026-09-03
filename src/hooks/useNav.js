'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

// Mobile menu open/close state for the navigation overlay.
//
// Shared rather than local: the section stage has to know when the menu is open
// so its keyboard handling stands down while the overlay owns the viewport. (Its
// pointer handling needs no such flag — the overlay is a fixed sibling outside
// the stage root, so gestures on it never reach the observer at all.)
const NavContext = createContext({ open: false, toggleMenu: () => {}, closeMenu: () => {} })

export const useNav = () => useContext(NavContext)

export default function NavProvider({ children }) {
  const [open, setOpen] = useState(false)

  const toggleMenu = useCallback(() => setOpen((p) => !p), [])
  const closeMenu = useCallback(() => setOpen(false), [])
  const value = useMemo(() => ({ open, toggleMenu, closeMenu }), [open, toggleMenu, closeMenu])

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}
