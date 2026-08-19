'use client'

import { createContext, useContext, useState } from 'react'

// Shared nav state. At lg and up the scroll owner (ScrollStage) drives both
// fields via setTheme/setSection based on scroll position — its overlapping
// cross-dissolve sections all sit in the viewport at once, so a per-section
// IntersectionObserver can't tell them apart there.
//
// Below lg the sections are sequential and the stage is disengaged, so an
// observer is fine: WorkMobile uses one to flip the bar graphite over its
// light-world cover. Anything that drives `theme` at that tier must also set it
// back to 'dark' on the way out — the other mobile sections never set it.
//
// theme   — nav colour (dark bg → light text, and vice versa).
// section — id of the section currently on stage, or null when the stage is
//           disengaged (below lg). The hero renders its own chrome, so the Nav
//           uses this to hide its bar there. Defaults to 'home' to match
//           ScrollStage's starting index: a null default would paint the bar
//           before the first effect ran and flash it over the hero.
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
