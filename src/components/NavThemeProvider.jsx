'use client'

import { createContext, useContext, useState } from 'react'

// Shared nav state. SectionStage owns both fields at every tier: it maps the
// active panel's index to a declared theme and pushes it here. Nothing measures
// anything — a per-section observer never could, since the panels are stacked
// and all occupy the viewport at once.
//
// Only the engaged stage writes. The two stages' media queries partition, so
// exactly one is engaged, and a disengaging stage deliberately writes nothing
// rather than resetting — otherwise crossing the lg breakpoint would stomp the
// values the incoming tier had just set.
//
// theme   — nav colour (dark bg → light text, and vice versa).
// section — hash of the panel currently on stage. The hero renders its own
//           chrome, so the Nav uses this to hide its bar there, and the mobile
//           menu uses it to mark the active row. Defaults to 'home' to match the
//           stage's starting index: a null default would paint the bar before
//           the first effect ran and flash it over the hero.
const NavThemeContext = createContext({ theme: 'dark', setTheme: () => {}, section: 'home', setSection: () => {} })

export const useNavTheme = () => useContext(NavThemeContext)

export default function NavThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark')
  const [section, setSection] = useState('home')

  return (
    <NavThemeContext.Provider value={{ theme, setTheme, section, setSection }}>
      {children}
    </NavThemeContext.Provider>
  )
}
