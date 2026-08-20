'use client'

import { motion } from 'framer-motion'

// Square bordered arrow control. Used for image up/down nav and the
// Next Project CTA. Pure render — caller wires onClick.
// theme: 'light' (dark glyph on porcelain) | 'dark' (light glyph over imagery)
//
// Emergent-light treatment (Vitrine): at rest the control is a faint form that
// nearly dissolves into its ground; attention (hover/focus) raises a soft light —
// a porcelain bloom in the dark world, an ink penumbra in the light world. No
// hard invert. The dark border only changes opacity (/10 → /40), never hue.
// See DESIGN.md — The Emergent-Light Rule.
export default function ArrowButton({ glyph, onClick, label, size = 'md', theme = 'light' }) {
  const dims = size === 'lg' ? 'w-[2.375rem] h-[2.375rem] text-sm' : 'w-9 h-9 text-[0.8125rem]'
  const palette =
    theme === 'dark'
      ? 'border-bone-porcelain/10 bg-bone-porcelain/[0.03] text-bone-porcelain/70 backdrop-blur-[0.1875rem] hover:border-bone-porcelain/40 hover:bg-bone-porcelain/[0.07] hover:text-bone-porcelain hover:[box-shadow:var(--glow-bone)] focus-visible:border-bone-porcelain/40 focus-visible:bg-bone-porcelain/[0.07] focus-visible:text-bone-porcelain focus-visible:[box-shadow:var(--glow-bone)]'
      : 'border-oxidized-graphite/10 bg-oxidized-graphite/[0.02] text-oxidized-graphite/70 backdrop-blur-[0.1875rem] hover:border-surgical-taupe/40 hover:bg-surgical-taupe/[0.08] hover:text-oxidized-graphite hover:[box-shadow:var(--penumbra-ink)] focus-visible:border-surgical-taupe/40 focus-visible:bg-surgical-taupe/[0.08] focus-visible:text-oxidized-graphite focus-visible:[box-shadow:var(--penumbra-ink)]'

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.94, y: 0 }}
      className={`ds-control flex items-center justify-center border transition-[color,background-color,border-color,box-shadow] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none ${dims} ${palette}`}
    >
      <span aria-hidden="true">{glyph}</span>
    </motion.button>
  )
}
