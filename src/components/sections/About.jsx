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
      {/* Background — sculptural form anchored left, bleeding into darkness */}
      <Image
        src={assets.about.background}
        alt={c.bgAlt}
        fill
        sizes="100vw"
        className="object-cover object-left"
      />
      {/* Left→right fade so the image dissolves into the dark text field on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-oxidized-graphite/50 to-oxidized-graphite md:from-transparent md:from-[12%] md:to-oxidized-graphite md:to-[58%]" />
      {/* Gentle top/bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-oxidized-graphite/30 via-transparent to-oxidized-graphite/40" />

      {/* Text column — right-aligned, vertically centred */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1400px] items-center justify-end px-6 md:px-[52px]">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="w-full md:w-[46%]"
        >
          <motion.p
            variants={lineReveal}
            className="mb-7 text-[10px] uppercase tracking-[0.35em] text-surgical-taupe"
          >
            {c.sectionLabel}
          </motion.p>

          <motion.p
            variants={lineReveal}
            className="text-[clamp(22px,2.6vw,40px)] font-light leading-[1.28] tracking-[0.01em] text-bone-porcelain"
          >
            {c.bio}
          </motion.p>

          <motion.p
            variants={lineReveal}
            className="mb-4 mt-12 text-[10px] uppercase tracking-[0.35em] text-surgical-taupe"
          >
            {c.statementLabel}
          </motion.p>
          <motion.p
            variants={lineReveal}
            className="text-[clamp(13px,1vw,16px)] font-light leading-[1.85] tracking-[0.01em] text-bone-porcelain/55"
          >
            {c.statement}
          </motion.p>

          {/* Social links — below the copy */}
          <motion.ul
            variants={lineReveal}
            className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3"
          >
            {c.social.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noreferrer"
                  className="group inline-flex items-center text-[11px] uppercase tracking-[0.22em] text-bone-porcelain/70 transition-colors duration-300 hover:text-synthetic-flesh"
                >
                  {link.label}
                  <span className="ml-2 inline-block h-px w-4 bg-current opacity-40 transition-all duration-300 group-hover:w-6 group-hover:opacity-80" />
                </a>
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  )
}
