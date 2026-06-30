'use client'

import { createContext, useContext, useMemo } from 'react'
import copy from '@/content/copy.json'

const LanguageContext = createContext(null)

// English-only provider. `t` is the copy tree for the active language; kept on
// context so sections stay locale-agnostic if more languages are added later.
export function LanguageProvider({ children }) {
  const value = useMemo(() => ({ lang: 'en', t: copy.en }), [])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

// Returns { lang, t } where `t` is the copy tree for the active language.
export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
