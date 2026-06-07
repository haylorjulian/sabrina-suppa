'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'

// loading (animation-spec): full-screen overlay with a choreographed exit that
// hands off into the hero entrance. Visibility is driven by usePreloader.
export default function Preloader({ loading }) {
  const { t } = useLanguage()

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-oxidized-graphite"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <span className="h-px w-10 bg-synthetic-flesh/45" />
            <span className="text-3xl italic font-extralight tracking-[0.08em] text-bone-porcelain md:text-4xl">
              {t.preloader.name}
            </span>
            <span className="text-[12px] uppercase tracking-[0.32em] text-synthetic-flesh/85">
              {t.preloader.descriptor}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
