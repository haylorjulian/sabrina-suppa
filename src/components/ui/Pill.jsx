'use client'

import { motion } from 'framer-motion'

// Work sub-type tab. The active pill is solid; layoutId lets the dark fill
// slide between pills (buttons-cta spec).
export default function Pill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="relative whitespace-nowrap rounded-full px-[22px] py-2 text-[9.5px] uppercase tracking-[0.20em] transition-colors duration-200"
    >
      {active && (
        <motion.span
          layoutId="pill-active"
          className="absolute inset-0 rounded-full bg-oxidized-graphite"
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
        />
      )}
      {!active && (
        <span className="absolute inset-0 rounded-full border border-dashed border-oxidized-graphite/40 bg-bone-porcelain/50" />
      )}
      <span
        className={`relative z-10 ${
          active ? 'text-bone-porcelain' : 'text-oxidized-graphite'
        }`}
      >
        {label}
      </span>
    </button>
  )
}
