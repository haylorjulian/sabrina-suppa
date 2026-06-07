'use client'

// page-transitions (animation-spec): React Spring. On a single-page site this
// fades the page content in on mount; reuse this wrapper around route changes
// when more pages are added.
import { useTransition, animated } from '@react-spring/web'

export default function PageTransitionWrapper({ children }) {
  const transitions = useTransition(true, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    config: { duration: 600 },
  })

  return transitions((style, item) =>
    item ? <animated.div style={style}>{children}</animated.div> : null
  )
}
