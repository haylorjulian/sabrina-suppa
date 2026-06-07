'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { assets } from '@/lib/assets'
import { useLanguage } from '@/hooks/useLanguage'
import { staggerContainer, lineReveal } from '@/lib/animations'

export default function About() {
  const { t } = useLanguage()
  const c = t.about
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-15% 0px' })

  return (
    <section
      id="about"
      ref={ref}
      data-nav-theme="dark"
      aria-label="About"
      className="relative h-full w-full overflow-hidden bg-oxidized-graphite"
    >
      {/* Image — left side on desktop (full-bleed on mobile), dissolving into the
          dark field on the right so it reads as extending across the screen. */}
      <div className="absolute inset-y-0 left-0 w-full md:w-[58%]">
        <Image
          src={assets.about.background}
          alt={c.bgAlt}
          fill
          sizes="(min-width: 768px) 58vw, 100vw"
          className="object-cover object-left"
        />
        {/* Blend the image's right edge into the section background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-oxidized-graphite" />
      </div>

      {/* Darken the image on mobile (text sits over it) + soft vignette */}
      <div className="absolute inset-0 bg-oxidized-graphite/45 md:bg-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-oxidized-graphite/30 via-transparent to-oxidized-graphite/40" />

      {/* Text column — right-aligned, vertically centred, sized to ~3/4 height */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1400px] items-center justify-end px-6 md:px-[52px]">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-h-[78svh] w-full md:w-[48%]"
        >
          <motion.p
            variants={lineReveal}
            className="mb-3 text-[11px] uppercase tracking-[0.35em] text-synthetic-flesh"
          >
            {c.sectionLabel}
          </motion.p>

          <motion.p
            variants={lineReveal}
            className="text-[clamp(14px,1.45vw,21px)] font-light leading-[1.42] tracking-[0.01em] text-bone-porcelain"
          >
            {c.bio}
          </motion.p>

          <motion.p
            variants={lineReveal}
            className="mb-2.5 mt-6 text-[11px] uppercase tracking-[0.35em] text-synthetic-flesh"
          >
            {c.statementLabel}
          </motion.p>
          <motion.p
            variants={lineReveal}
            className="text-[clamp(11px,0.92vw,13px)] font-light leading-[1.55] tracking-[0.01em] text-bone-porcelain/80"
          >
            {c.statement}
          </motion.p>

          {/* Social links — below the copy */}
          <motion.ul
            variants={lineReveal}
            className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3"
          >
            {c.social.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noreferrer"
                  className="group inline-flex items-center text-[12px] uppercase tracking-[0.22em] text-bone-porcelain/80 transition-colors duration-300 hover:text-synthetic-flesh"
                >
                  {link.label}
                  <span className="ml-2 inline-block h-px w-4 bg-current opacity-50 transition-all duration-300 group-hover:w-6 group-hover:opacity-90" />
                </a>
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  )
}
