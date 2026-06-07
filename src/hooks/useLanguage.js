'use client'

import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import copy from '@/content/copy.json'

const LanguageContext = createContext(null)

const LANGS = ['en', 'it']

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')

  const toggle = useCallback(() => {
    setLang((prev) => (prev === 'en' ? 'it' : 'en'))
  }, [])

  const value = useMemo(
    () => ({ lang, langs: LANGS, toggle, setLang, t: copy[lang] }),
    [lang, toggle]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

// Returns { lang, toggle, setLang, t } where `t` is the copy tree for the active language.
export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
