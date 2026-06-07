'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { assets } from '@/lib/assets'
import { useLanguage } from '@/hooks/useLanguage'
import { useBlurBands } from '@/hooks/useBlurBands'
import { staggerContainer, lineReveal } from '@/lib/animations'

export default function About() {
  const { t } = useLanguage()
  const c = t.about
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-15% 0px' })
  const bands = useBlurBands()

  return (
    <section
      id="about"
      ref={ref}
      data-nav-theme="dark"
      aria-label="About"
      className="relative h-screen min-h-[600px] w-full overflow-hidden bg-oxidized-graphite"
    >
      {/* Base image — renders once, full screen */}
      <Image
        src={assets.about.background}
        alt={c.bgAlt}
        fill
        sizes="100vw"
        className="object-cover"
      />

      {/* Vertical blur bands (backdrop-filter is computed per band → inline style) */}
      {bands.map((band, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="absolute inset-y-0"
          style={{
            left: `${band.left}%`,
            width: `${band.width}%`,
            backdropFilter: band.blur ? `blur(${band.blur}px)` : undefined,
            WebkitBackdropFilter: band.blur ? `blur(${band.blur}px)` : undefined,
          }}
        >
          {band.showDivider && (
            <span className="absolute inset-y-0 left-0 w-px bg-bone-porcelain/[0.18]" />
          )}
        </div>
      ))}

      {/* Dark overlay anchoring the heaviest blur on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-oxidized-graphite/50 to-oxidized-graphite/85" />

      {/* Text — bottom-left, over the sharp band */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="absolute bottom-16 left-6 z-10 w-[78%] md:left-[52px] md:w-[38%]"
      >
        <motion.p
          variants={lineReveal}
          className="mb-5 text-[9px] uppercase tracking-[0.35em] text-synthetic-flesh"
        >
          {c.sectionLabel}
        </motion.p>
        <motion.p
          variants={lineReveal}
          className="mb-9 text-[clamp(13px,1.2vw,16px)] font-light leading-[1.85] tracking-[0.01em] text-bone-porcelain/90"
        >
          {c.bio}
        </motion.p>
        <motion.p
          variants={lineReveal}
          className="mb-4 text-[9px] uppercase tracking-[0.35em] text-surgical-taupe"
        >
          {c.statementLabel}
        </motion.p>
        <motion.p
          variants={lineReveal}
          className="text-[clamp(12px,1.05vw,14px)] font-extralight italic leading-[2] tracking-[0.01em] text-bone-porcelain/55"
        >
          {c.statement}
        </motion.p>
      </motion.div>
    </section>
  )
}
