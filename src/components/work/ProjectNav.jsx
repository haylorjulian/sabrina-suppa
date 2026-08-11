'use client'

import Link from 'next/link'

// Within-category wayfinding on a project page: a fixed, right-aligned column of
// the category's projects, sitting under the rule that divides the header from
// the page content (ProjectGallery draws it at 104px — this must clear it, or the
// rule strikes through the first project). Dark-world (galleries are graphite).
// The active project is marked with an extended porcelain tick at full opacity —
// never a fill; siblings hold the same hue and read as quieter only through
// opacity and length, which is what separates the states here. Dimmed siblings
// light up on hover. Desktop-only; hidden with a single project.
export default function ProjectNav({ siblings = [] }) {
  if (siblings.length <= 1) return null

  return (
    <nav
      aria-label="Projects in this category"
      className="fixed right-6 top-[144px] z-40 hidden flex-col items-end gap-3 md:right-[52px] lg:flex"
    >
      {siblings.map((p) =>
        p.active ? (
          <span key={p.href} aria-current="page" className="flex items-center gap-3">
            <span className="font-neue-haas-display text-[15px] font-light italic tracking-[0.01rem] text-bone-porcelain">
              {p.title}
            </span>
            <span aria-hidden="true" className="h-px w-8 bg-bone-porcelain" />
          </span>
        ) : (
          <Link key={p.href} href={p.href} className="group flex items-center gap-3">
            <span className="font-neue-haas-display text-[15px] font-light italic tracking-[0.01rem] text-bone-porcelain/40 transition-colors duration-300 group-hover:text-bone-porcelain/80 motion-reduce:transition-none">
              {p.title}
            </span>
            <span
              aria-hidden="true"
              className="h-px w-4 bg-bone-porcelain/25 transition-all duration-300 group-hover:w-6 group-hover:bg-bone-porcelain/50 motion-reduce:transition-none"
            />
          </Link>
        )
      )}
    </nav>
  )
}
