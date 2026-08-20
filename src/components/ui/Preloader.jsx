'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import ShimmerLine from './ShimmerLine'

// Hairlines dissolve at both ends: slowly into the ground at the outer edge, and
// again over the last OVERLAP px as they run in behind the label.
const OVERLAP = '1.75rem'
const dissolve = (outward) => {
  const gradient = `linear-gradient(to ${outward}, transparent, black 60%, black calc(100% - ${OVERLAP}), transparent)`
  return { maskImage: gradient, WebkitMaskImage: gradient }
}
const dissolveLeft = dissolve('right')
const dissolveRight = dissolve('left')

// loading (animation-spec): full-screen overlay with a choreographed exit that
// hands off into the hero entrance. Visibility is driven by usePreloader.
export default function Preloader({ loading, instant = false }) {
  const { t } = useLanguage()

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-oxidized-graphite"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: instant ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] } }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full max-w-[53.75rem] items-center px-8"
          >
            <span className="flex-1 opacity-50 -mr-7" style={dissolveLeft}>
              <ShimmerLine orientation="horizontal" reverse className="w-full" />
            </span>
            <span className="relative z-10 text-[0.6875rem] italic uppercase tracking-[0.32em] text-bone-porcelain/40">
              {t.preloader.label}
            </span>
            <span className="flex-1 opacity-50 -ml-7" style={dissolveRight}>
              <ShimmerLine orientation="horizontal" className="w-full" />
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
