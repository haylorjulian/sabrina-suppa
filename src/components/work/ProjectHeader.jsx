'use client'

import Link from 'next/link'
import { setSectionTarget } from '@/lib/sectionTarget'
import { useLanguage } from '@/hooks/useLanguage'

// Lightweight fixed header for standalone project routes (the global <Nav> is
// mounted only on the home route). Dark theme — galleries sit on graphite, so
// the wordmark is always light here; there's no two-column split to invert
// against the way there is on Work/About (see Nav.jsx).
export default function ProjectHeader() {
  const { t } = useLanguage()

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Scrim so the bar stays legible over imagery as it scrolls past */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-oxidized-graphite/85 to-transparent" />
      <nav className="relative flex items-center justify-between px-6 py-7 md:px-[52px]">
        {/* Both variants render; CSS picks one. Branching on a JS breakpoint here
            would disagree with the server render and blow up hydration. */}
        <Link
          href="/"
          aria-label={t.nav.logoFull}
          className="font-ivyora-display font-thin text-[14px] uppercase tracking-[8px] opacity-80 text-bone-porcelain/80 transition-colors duration-300 hover:text-bone-porcelain"
        >
          <span aria-hidden="true" className="lg:hidden">
            {t.nav.logo}
          </span>
          <span aria-hidden="true" className="hidden lg:inline">
            {t.nav.logoFull}
          </span>
        </Link>
        <Link
          href="/#work"
          onClick={() => setSectionTarget('work')}
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-bone-porcelain/60 transition-colors duration-300 hover:text-bone-porcelain"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden="true">
            <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to work
        </Link>
      </nav>
    </header>
  )
}
