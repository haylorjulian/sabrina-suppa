'use client'

import { motion } from 'framer-motion'

// Thin vertical line with a light beam travelling down it — the hero scroll-line
// treatment, reused for the Work image navigation. Height is set via className.
// tone: 'light' (on dark backgrounds) | 'dark' (on light backgrounds)
export default function ShimmerLine({ tone = 'light', className = 'h-16' }) {
  const track = tone === 'dark' ? 'bg-oxidized-graphite/25' : 'bg-bone-porcelain/40'
  const beam = tone === 'dark' ? 'via-oxidized-graphite' : 'via-bone-porcelain'
  return (
    <span className={`relative block w-[1.5px] overflow-hidden ${track} ${className}`}>
      <motion.span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent ${beam} to-transparent`}
        animate={{ y: ['-110%', '210%'] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.3 }}
      />
    </span>
  )
}
