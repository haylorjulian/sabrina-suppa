'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

// One scroll-snap slide. Each section fades up as it reaches the viewport centre
// and fades back out as it leaves, so adjacent sections crossfade through the
// dark page background during the snap. Opacity only (no transform) — keeps the
// hero's fixed preloader/nav viewport-fixed.
export default function SectionFade({ children }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.32, 0.68, 1], [0.15, 1, 1, 0.15])

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className="h-[100svh] snap-start snap-always"
    >
      {children}
    </motion.div>
  )
}
