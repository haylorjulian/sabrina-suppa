'use client'

import { LanguageProvider } from '@/hooks/useLanguage'
import NavProvider from '@/hooks/useNav'
import NavThemeProvider from '@/components/NavThemeProvider'

// Client provider tree mounted once in the layout.
export default function Providers({ children }) {
  return (
    <LanguageProvider>
      <NavProvider>
        <NavThemeProvider>{children}</NavThemeProvider>
      </NavProvider>
    </LanguageProvider>
  )
}
