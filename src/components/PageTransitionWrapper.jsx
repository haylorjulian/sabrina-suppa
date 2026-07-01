'use client'

// page-transitions: a quick crossfade on every route change so navigation feels
// smooth instead of abrupt. Keying the motion element on the pathname re-mounts
// (and re-fades) the page whenever the route changes — home ↔ project, and
// project ↔ project via prev/next. In-page section nav on home (#work etc.)
// doesn't change the pathname, so those keep ScrollStage's own crossfade.
//
// App Router unmounts the outgoing page synchronously, so this is an enter-fade
// (the reliable pattern here) rather than a true old+new cross-dissolve.
// `duration` below is the knob for how fast it feels.
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function PageTransitionWrapper({ children }) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
