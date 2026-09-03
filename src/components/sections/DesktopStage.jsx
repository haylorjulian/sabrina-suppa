'use client'

import { useMemo } from 'react'
import SectionStage from '@/components/ui/SectionStage'
import { useNav } from '@/hooks/useNav'
import { usePreloaderState } from '@/components/PreloaderProvider'
import Hero from '@/components/sections/Hero'
import Work from '@/components/sections/Work'
import About from '@/components/sections/About'
import Connect from '@/components/sections/Connect'

const DESKTOP = '(min-width: 1024px)'

// The lg+ panel list: one panel per section, each a two-column composition that
// fits the viewport exactly. `theme` is what sits *under the nav bar*, not the
// section's ground — on Work the links ride the dark image column while the
// wordmark inverts against the light one (see Nav.jsx).
export default function DesktopStage() {
  const { open } = useNav()
  const { loading } = usePreloaderState()

  const panels = useMemo(
    () => [
      { key: 'home', hash: 'home', theme: 'dark', label: 'Hero' },
      { key: 'work', hash: 'work', theme: 'light', label: 'Work' },
      { key: 'about', hash: 'about', theme: 'dark', label: 'About' },
      { key: 'connect', hash: 'connect', theme: 'dark', label: 'Connect' },
    ],
    []
  )

  return (
    <SectionStage media={DESKTOP} panels={panels} disabled={loading || open}>
      <Hero />
      <Work />
      <About />
      <Connect />
    </SectionStage>
  )
}
