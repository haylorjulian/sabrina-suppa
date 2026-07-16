// Framer Motion variant sets — import from here, never define inline.
// Tuned for the animation-spec mood: ["minimal", "editorial", "creative flair"],
// intensity "balanced" — restrained easing, low displacement.

const EASE = [0.22, 1, 0.36, 1]

// hero — staggered entrance: name, right rail, footer strip
export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

// text-effects — split word/line entrance
export const lineReveal = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

// scroll-animations / shared stagger wrapper
export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

export const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

// images — reveal + soft scale settle
export const imageReveal = {
  hidden: { opacity: 0, scale: 1.04 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: EASE } },
}

// scroll-animations — generic section entrance
export const sectionFade = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
}

// loading — full-screen preloader overlay exit
export const preloaderExit = {
  initial: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.9, ease: EASE } },
}

// navigation — AnimatePresence mobile menu
export const mobileMenu = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3, ease: EASE } },
}

// images — crossfade when switching gallery image/project
export const crossfade = {
  initial: { opacity: 0, scale: 1.03 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE } },
  exit: { opacity: 0, scale: 0.99, transition: { duration: 0.4, ease: EASE } },
}

// buttons-cta — shared hover/tap gestures
export const hoverTap = {
  whileHover: { scale: 1.04 },
  whileTap: { scale: 0.96 },
}
