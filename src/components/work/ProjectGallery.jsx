'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp, lineReveal } from '@/lib/animations'
import GalleryMedia from './GalleryMedia'
import ProjectHeader from './ProjectHeader'

export default function ProjectGallery({ categoryLabel, project, media, prev, next }) {
  // The home route snaps each section to the viewport (html { scroll-snap-type:
  // y mandatory }). A long gallery must scroll freely — neutralise snap here and
  // restore it on unmount.
  useEffect(() => {
    const html = document.documentElement
    const prevSnap = html.style.scrollSnapType
    html.style.scrollSnapType = 'none'
    return () => {
      html.style.scrollSnapType = prevSnap
    }
  }, [])

  return (
    <div className="min-h-[100dvh] bg-oxidized-graphite text-bone-porcelain">
      <ProjectHeader />

      {/* Intro */}
      <motion.header
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-[1100px] px-6 pb-16 pt-[148px] md:pb-24"
      >
        <motion.p
          variants={lineReveal}
          className="font-copperplate text-[12px] uppercase tracking-[0.28em] text-synthetic-flesh/70"
        >
          {categoryLabel}
        </motion.p>
        <motion.h1
          variants={fadeInUp}
          className="mt-5 font-cormorant text-[clamp(30px,5vw,64px)] font-light italic leading-[1.05] tracking-[0.01em]"
        >
          {project.title}
        </motion.h1>
        {project.description && (
          <motion.p
            variants={fadeInUp}
            className="body-copy-lg mt-6 max-w-[62ch] whitespace-pre-line font-light text-bone-porcelain/70"
          >
            {project.description}
          </motion.p>
        )}
      </motion.header>

      {/* Media — full-width column grid. Column count is capped per breakpoint:
          1 on phones, 2 from tablet through laptop, 3 on large monitors, 4 max on
          very large screens. Each image fills its column and keeps native aspect. */}
      <div className="grid grid-cols-1 gap-2 px-4 pb-24 sm:grid-cols-2 sm:px-6 lg:px-10 2xl:grid-cols-3 min-[1920px]:grid-cols-4">
        {media.map((it, i) => (
          <GalleryMedia key={it.src} item={it} alt={`${project.title} — image ${i + 1}`} />
        ))}
      </div>

      {/* Footer: cycle to sibling projects */}
      <footer className="border-t border-bone-porcelain/10">
        <nav className="mx-auto flex max-w-[1100px] items-center justify-between gap-6 px-6 py-12">
          <Link
            href={prev.href}
            className="flex flex-col gap-1 text-bone-porcelain/55 transition-colors duration-300 hover:text-bone-porcelain"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-bone-porcelain/35">Previous</span>
            <span className="font-cormorant text-lg font-light italic">{prev.title}</span>
          </Link>
          <Link
            href="/#work"
            className="shrink-0 text-[11px] uppercase tracking-[0.24em] text-bone-porcelain/45 transition-colors duration-300 hover:text-bone-porcelain"
          >
            Index
          </Link>
          <Link
            href={next.href}
            className="flex flex-col items-end gap-1 text-right text-bone-porcelain/55 transition-colors duration-300 hover:text-bone-porcelain"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-bone-porcelain/35">Next</span>
            <span className="font-cormorant text-lg font-light italic">{next.title}</span>
          </Link>
        </nav>
      </footer>
    </div>
  )
}
