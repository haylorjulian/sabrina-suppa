'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

// One scroll-snap slide. Each section fades up as it reaches the viewport centre
// and fades back out as it leaves, so adjacent sections crossfade through the
// dark page background during the snap. Opacity only (no transform) — keeps the
// hero's fixed preloader/nav viewport-fixed.
//
// min-h, not h: a category sheet opens to the full height of its description and
// can push its section past one screen (see WorkMobile). A fixed height here
// would crop that overflow instead of letting the page scroll to it. Snapping
// tolerates that growth — an oversized snap area stays freely scrollable (see
// globals.css).
//
// Height comes from .section-fullscreen (globals.css): the large viewport, held
// stable so the cover never resizes or recrops as the phone's URL bar moves. The
// bottom-edge content compensates for the chrome on its own — here that is the
// category sheet inside CategoryCover.
//
// snap-start / snap-always were inert until the mobile snap type landed; they
// are now the snap point for each category cover.
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
      className="section-fullscreen snap-start snap-always"
    >
      {children}
    </motion.div>
  )
}
