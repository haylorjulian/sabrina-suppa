'use client'

import { motion } from 'framer-motion'

// Thin line with a light beam travelling along it — the hero scroll-line
// treatment, reused for the Work image navigation. Length is set via className.
// tone: 'light' (on dark bg) | 'dark' (on light bg)
// orientation: 'vertical' (default) | 'horizontal'
// reverse: run the beam right-to-left (horizontal) or bottom-to-top (vertical)
export default function ShimmerLine({ tone = 'light', orientation = 'vertical', thick = false, reverse = false, className = 'h-16' }) {
  const track = tone === 'dark' ? 'bg-oxidized-graphite/25' : 'bg-bone-porcelain/40'
  const beam = tone === 'dark' ? 'via-oxidized-graphite' : 'via-bone-porcelain'
  const travel = reverse ? ['210%', '-110%'] : ['-110%', '210%']

  if (orientation === 'horizontal') {
    return (
      <span className={`relative block ${thick ? 'h-[0.1875rem]' : 'h-[0.0938rem]'} overflow-hidden ${track} ${className}`}>
        <motion.span
          aria-hidden="true"
          className={`absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent ${beam} to-transparent`}
          animate={{ x: travel }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.3 }}
        />
      </span>
    )
  }

  return (
    <span className={`relative block ${thick ? 'w-[0.1875rem]' : 'w-[0.0938rem]'} overflow-hidden ${track} ${className}`}>
      <motion.span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent ${beam} to-transparent`}
        animate={{ y: travel }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.3 }}
      />
    </span>
  )
}
