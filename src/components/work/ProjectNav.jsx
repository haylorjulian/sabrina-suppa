'use client'

import Link from 'next/link'

// Within-category wayfinding on a project page: a fixed, right-aligned column of
// the category's projects, sitting under the "Back to work" line. Dark-world
// (galleries are graphite). The active project is marked with the one rare accent
// (synthetic-flesh) as an extended tick — never a fill — per DESIGN.md. Siblings
// stay dimmed and light on hover. Desktop-only; hidden with a single project.
export default function ProjectNav({ siblings = [] }) {
  if (siblings.length <= 1) return null

  return (
    <nav
      aria-label="Projects in this category"
      className="fixed right-6 top-24 z-40 hidden flex-col items-end gap-3 md:right-[52px] lg:flex"
    >
      {siblings.map((p) =>
        p.active ? (
          <span key={p.href} aria-current="page" className="flex items-center gap-3">
            <span className="font-cormorant text-[15px] font-light italic text-bone-porcelain">
              {p.title}
            </span>
            <span aria-hidden="true" className="h-px w-8 bg-synthetic-flesh" />
          </span>
        ) : (
          <Link key={p.href} href={p.href} className="group flex items-center gap-3">
            <span className="font-cormorant text-[15px] font-light italic text-bone-porcelain/40 transition-colors duration-300 group-hover:text-bone-porcelain/80 motion-reduce:transition-none">
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
