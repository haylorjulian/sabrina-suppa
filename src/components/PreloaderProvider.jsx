'use client'

import { createContext, useContext } from 'react'
import { usePreloader } from '@/hooks/usePreloader'
import Preloader from '@/components/ui/Preloader'

// Owns the preloader for the home route: runs usePreloader once (a single timer /
// session flag / scroll lock) and shares `loading` so the hero can gate its
// entrance on it. Critically, the overlay is rendered HERE — a sibling of <Nav>
// and <main>, not inside a section — so its z-100 sits above the nav's z-50.
// Inside ScrollStage each section is an absolutely-positioned motion.div with its
// own z-index (a stacking context), which would otherwise trap the overlay
// beneath the nav.
const PreloaderContext = createContext({ loading: true, instant: false })

export const usePreloaderState = () => useContext(PreloaderContext)

export default function PreloaderProvider({ children }) {
  const state = usePreloader()

  return (
    <PreloaderContext.Provider value={state}>
      <Preloader loading={state.loading} instant={state.instant} />
      {children}
    </PreloaderContext.Provider>
  )
}
