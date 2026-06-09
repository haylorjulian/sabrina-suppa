'use client'

import { LanguageProvider } from '@/hooks/useLanguage'
import NavThemeProvider from '@/components/NavThemeProvider'

// Client provider tree mounted once in the layout.
export default function Providers({ children }) {
  return (
    <LanguageProvider>
      <NavThemeProvider>{children}</NavThemeProvider>
    </LanguageProvider>
  )
}
