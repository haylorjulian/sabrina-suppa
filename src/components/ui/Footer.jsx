'use client'

import { useLanguage } from '@/hooks/useLanguage'

// Shared footer strip: a rule over a location / copyright / email row. Reused by
// the desktop hero chrome, the end of the mobile home page, and the project page.
//
// The row keeps DOM order (location, copyright, email) at every width and uses
// explicit grid placement so it reflows without reordering markup: on mobile it
// splits into two rows — location + email flanking the top, copyright centered
// below — collapsing to the single-line 1fr/auto/1fr strip from `sm` up. A plain
// non-responsive grid let the wide, no-wrap copyright collide with the side
// columns on narrow screens.
//
// `shadow` adds the hero's functional text-shadow for legibility over imagery
// (no drop shadows — text-shadow only, per DESIGN.md); off elsewhere.
export default function Footer({ className = '', shadow = false, rowPadding = 'py-[1.3125rem]' }) {
  const { t } = useLanguage()
  const f = t.hero.footer
  const sh = shadow ? '[text-shadow:0_1px_8px_rgba(26,26,28,0.7)]' : ''

  return (
    <div className={className}>
      <div className="h-px w-full bg-bone-porcelain/25" />
      <div className={`grid grid-cols-2 items-center gap-y-3 ${rowPadding} font-neue-haas-display text-[0.6875rem] uppercase tracking-[0.24em] text-bone-porcelain/70 sm:grid-cols-[1fr_auto_1fr] sm:gap-y-0`}>
        <span className={`col-start-1 row-start-1 justify-self-start ${sh}`}>{f.location}</span>
        <span
          className={`col-span-2 row-start-2 justify-self-center whitespace-nowrap sm:col-span-1 sm:col-start-2 sm:row-start-1 ${sh}`}
        >
          {f.copyright}
        </span>
        <a
          href={`mailto:${f.email}`}
          className={`nav-link col-start-2 row-start-1 justify-self-end text-bone-porcelain/65 transition-colors duration-300 hover:text-bone-porcelain sm:col-start-3 ${sh}`}
        >
          {f.email}
        </a>
      </div>
    </div>
  )
}
