'use client'

import { createContext, useContext, useState } from 'react'

// Shared nav colour theme. The scroll owner (ScrollStage) drives it via setTheme
// based on scroll position — overlapping cross-dissolve sections all sit in the
// viewport at once, so a per-section IntersectionObserver can't tell them apart.
const NavThemeContext = createContext({ theme: 'dark', setTheme: () => {} })

export const useNavTheme = () => useContext(NavThemeContext)

export default function NavThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark')

  return <NavThemeContext.Provider value={{ theme, setTheme }}>{children}</NavThemeContext.Provider>
}
