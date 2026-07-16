'use client'

import { createContext, useContext, useState } from 'react'

// Shared nav state. The scroll owner (ScrollStage) drives both fields via
// setTheme/setSection based on scroll position — overlapping cross-dissolve
// sections all sit in the viewport at once, so a per-section IntersectionObserver
// can't tell them apart.
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
