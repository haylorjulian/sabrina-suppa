'use client'

import { LanguageProvider } from '@/hooks/useLanguage'

// Client provider tree mounted once in the layout.
export default function Providers({ children }) {
  return <LanguageProvider>{children}</LanguageProvider>
}
