'use client'

import { motion } from 'framer-motion'

// Arrow icon with the same travelling-beam treatment as ShimmerLine, conformed
// to the arrow's silhouette (shaft + head) via a CSS mask instead of a
// rectangular clip, so the beam sweeps the whole glyph as one shape.
// tone: 'light' (on dark bg) | 'dark' (on light bg)
const ARROW_PATH = 'M0,6 H30 M25.5,2.25 L30,6 L25.5,9.75'
const ARROW_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 12'><path d='${ARROW_PATH}' fill='none' stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>`
)}")`

export default function ShimmerArrow({ tone = 'light', className = 'h-3 w-9' }) {
  const track = tone === 'dark' ? 'bg-oxidized-graphite/40' : 'bg-bone-porcelain/50'
  const beam = tone === 'dark' ? 'via-oxidized-graphite' : 'via-bone-porcelain'

  return (
    <span
      aria-hidden="true"
      className={`relative block shrink-0 ${className}`}
      style={{
        WebkitMaskImage: ARROW_MASK,
        maskImage: ARROW_MASK,
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
      }}
    >
      <span className={`absolute inset-0 ${track}`} />
      <motion.span
        className={`absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent ${beam} to-transparent`}
        animate={{ x: ['-110%', '210%'] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.3 }}
      />
    </span>
  )
}
