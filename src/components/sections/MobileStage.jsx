'use client'

import { useMemo } from 'react'
import SectionStage from '@/components/ui/SectionStage'
import { useLanguage } from '@/hooks/useLanguage'
import { useNav } from '@/hooks/useNav'
import { usePreloaderState } from '@/components/PreloaderProvider'
import Hero from '@/components/sections/Hero'
import WorkCategoryPanel from '@/components/sections/WorkCategoryPanel'
import About from '@/components/sections/About'
import Connect from '@/components/sections/Connect'

const MOBILE = '(max-width: 1023.98px)'

// The below-lg panel list. It is longer than the desktop one: Work is not a
// single section here but one full-screen cover per category, which is how the
// mobile design has always worked — it was simply a run of scroll-snap points
// before rather than a run of panels.
//
// Derived from content, never hardcoded: categories come from the CMS pipeline
// (src/content/categories/*.json → build-content.mjs), so a category the client
// adds appears here as its own panel with no code change.
export default function MobileStage() {
  const { t } = useLanguage()
  const { open } = useNav()
  const { loading } = usePreloaderState()
  const categories = t.work.categories

  const panels = useMemo(
    () => [
      { key: 'home', hash: 'home', theme: 'dark', label: 'Hero' },
      ...categories.map((cat) => ({
        key: `work-${cat.slug}`,
        // Both covers answer to #work, and the nav resolves it to the first
        // match. The hash vocabulary stays the four ids the nav can actually
        // produce — a #work-physical nothing links to is a hash that would rot.
        hash: 'work',
        // overlayTextColor "dark" means dark ink on a bright photograph, i.e. a
        // light world under the bar. This is the mapping WorkMobile used to
        // derive by measuring the cover's rect against the hamburger every frame.
        theme: cat.overlayTextColor === 'dark' ? 'light' : 'dark',
        label: cat.label,
      })),
      { key: 'about', hash: 'about', theme: 'dark', label: 'About' },
      { key: 'connect', hash: 'connect', theme: 'dark', label: 'Connect' },
    ],
    [categories]
  )

  return (
    <SectionStage media={MOBILE} panels={panels} disabled={loading || open}>
      <Hero sectionId="home" />
      {categories.map((cat) => (
        <WorkCategoryPanel key={cat.slug} cat={cat} ui={t.work} />
      ))}
      <About sectionId="about" />
      <Connect sectionId="connect" />
    </SectionStage>
  )
}
