'use client'

import { motion } from 'framer-motion'

// Square bordered arrow control. Used for image up/down nav and the
// Next Project CTA. Pure render — caller wires onClick.
// theme: 'light' (dark borders/glyph on light bg) | 'dark' (light on dark)
export default function ArrowButton({ glyph, onClick, label, size = 'md', theme = 'light' }) {
  const dims = size === 'lg' ? 'w-[38px] h-[38px] text-sm' : 'w-9 h-9 text-[13px]'
  const palette =
    theme === 'dark'
      ? 'border-bone-porcelain/30 text-bone-porcelain hover:bg-bone-porcelain hover:text-oxidized-graphite'
      : 'border-oxidized-graphite/30 text-oxidized-graphite hover:bg-oxidized-graphite hover:text-bone-porcelain'

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      className={`flex items-center justify-center border bg-transparent transition-colors duration-200 ${dims} ${palette}`}
    >
      <span aria-hidden="true">{glyph}</span>
    </motion.button>
  )
}
