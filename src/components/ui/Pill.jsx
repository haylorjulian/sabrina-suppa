'use client'

import { motion } from 'framer-motion'

// Work sub-type tab. The active pill is solid; layoutId lets the dark fill
// slide between pills (buttons-cta spec).
//
// Emergent-light treatment (Vitrine, light world): the active lozenge floats on
// a soft ink penumbra with a faint flesh halo; idle tabs are quiet forms (no
// dashes) that warm with a taupe glow and lift on attention — objects settling
// under museum glass. See DESIGN.md — The Emergent-Light Rule.
export default function Pill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="ds-control group relative whitespace-nowrap rounded-full px-[22px] py-2 text-[9.5px] uppercase tracking-[0.20em] transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px focus-visible:-translate-y-px focus-visible:outline-none"
    >
      {active && (
        <motion.span
          layoutId="pill-active"
          className="absolute inset-0 rounded-full bg-oxidized-graphite [box-shadow:var(--penumbra-ink),var(--flesh-halo)]"
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
        />
      )}
      {!active && (
        <span className="absolute inset-0 rounded-full border border-oxidized-graphite/10 bg-surgical-taupe/[0.05] backdrop-blur-[3px] transition-[background-color,border-color,box-shadow] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-surgical-taupe/40 group-hover:bg-surgical-taupe/[0.09] group-hover:[box-shadow:var(--penumbra-ink)] group-focus-visible:border-surgical-taupe/40 group-focus-visible:bg-surgical-taupe/[0.09] group-focus-visible:[box-shadow:var(--penumbra-ink)]" />
      )}
      <span
        className={`relative z-10 ${
          active ? 'text-bone-porcelain' : 'text-oxidized-graphite/85'
        }`}
      >
        {label}
      </span>
    </button>
  )
}
