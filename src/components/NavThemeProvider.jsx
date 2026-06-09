'use client'

import { createContext, useContext, useEffect, useState } from 'react'

// Shared nav colour theme. Sections declare data-nav-theme="dark|light" and an
// IntersectionObserver sets it on scroll; components (e.g. the Work section,
// which switches between a dark landing and a light projects view) can also set
// it directly via setTheme.
const NavThemeContext = createContext({ theme: 'dark', setTheme: () => {} })

export const useNavTheme = () => useContext(NavThemeContext)

export default function NavThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('[data-nav-theme]'))
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTheme(entry.target.getAttribute('data-nav-theme') || 'dark')
          }
        })
      },
      { rootMargin: '-10% 0px -85% 0px', threshold: 0 }
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return <NavThemeContext.Provider value={{ theme, setTheme }}>{children}</NavThemeContext.Provider>
}
