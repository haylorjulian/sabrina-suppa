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
// svh, deliberately, matching every other mobile section. It is the stable unit:
// it does not change as the phone's URL bar retracts, so a section never resizes
// mid-scroll and never fights the snap. The cost is that once the bar is hidden
// the visible area is taller than the section, so a snapped section can sit a
// little short of the screen — the accepted trade for not moving underfoot.
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
      className="min-h-[100svh] snap-start snap-always"
    >
      {children}
    </motion.div>
  )
}
