'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNav } from '@/hooks/useNav'
import { useLanguage } from '@/hooks/useLanguage'
import { useNavTheme } from '@/components/NavThemeProvider'
import { DURATION } from '@/components/ui/ScrollStage'
import { InstagramIcon, LinktreeIcon, SocialIcon } from '@/components/ui/icons'

// Single fixed nav shared across all sections. Its colour theme adapts to the
// section currently under the bar — sections declare data-nav-theme="dark|light"
// (dark bg → light text, light bg → dark text).
//
// The bar hides itself on the desktop hero, which carries its own chrome (a right
// rail + footer strip). Below lg there is no stage, so it always shows.
const overlayContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.08, delayChildren: 0.12 },
  },
  exit: { opacity: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
}
const overlayItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export default function Nav() {
  const { open, toggleMenu, closeMenu } = useNav()
  const { t } = useLanguage()
  const { theme, section } = useNavTheme()

  // Lock page scroll while the full-screen menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const isDark = theme === 'dark'
  const barDark = isDark || open
  const linkColor = barDark
    ? 'text-bone-porcelain/65 hover:text-bone-porcelain'
    : 'text-oxidized-graphite/55 hover:text-oxidized-graphite'
  const logoColor = barDark ? 'text-bone-porcelain/80' : 'text-oxidized-graphite/75'
  const hamColor = barDark ? 'bg-bone-porcelain' : 'bg-oxidized-graphite'

  const socialHref = (label) => t.about.social.find((s) => s.label === label)?.href || '#'

  // The hero owns its own chrome, so the bar steps aside there — fading against
  // the stage's crossfade so the two move as one. `invisible` (not just opacity)
  // is what takes the links out of the focus order while they're hidden.
  const hiddenOnHero = section === 'home'

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        style={{ transitionDuration: `${DURATION}s`, transitionTimingFunction: 'var(--ease-signature)' }}
        className={`flex items-center justify-between px-6 py-7 transition-[opacity,visibility] md:px-[52px] ${
          hiddenOnHero ? 'lg:invisible lg:opacity-0' : ''
        }`}
      >
        <a
          href="#home"
          onClick={closeMenu}
          className={`font-copperplate text-[14px] uppercase tracking-[0.28em] transition-colors duration-300 ${logoColor}`}
        >
          {t.nav.logo}
        </a>

        {/* Desktop links + social icons */}
        <div className="hidden items-center gap-9 md:flex">
          {t.nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`nav-link font-copperplate text-[14px] uppercase tracking-[0.20em] transition-colors duration-300 ${linkColor}`}
            >
              {link.label}
            </a>
          ))}
          <a
            href={socialHref('Instagram')}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className={`transition-colors duration-300 ${linkColor}`}
          >
            <InstagramIcon className="h-[19px] w-[19px]" />
          </a>
          <a
            href={socialHref('Linktree')}
            target="_blank"
            rel="noreferrer"
            aria-label="Linktree"
            className={`transition-colors duration-300 ${linkColor}`}
          >
            <LinktreeIcon className="h-[19px] w-[19px]" />
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={toggleMenu}
          aria-label={open ? t.nav.closeLabel : t.nav.menuLabel}
          aria-expanded={open}
          className="relative z-50 flex h-5 w-6 flex-col justify-center gap-[5px] md:hidden"
        >
          <span className={`block h-px w-full transition-transform duration-300 ${hamColor} ${open ? 'translate-y-[3px] rotate-45' : ''}`} />
          <span className={`block h-px w-full transition-transform duration-300 ${hamColor} ${open ? '-translate-y-[3px] -rotate-45' : ''}`} />
        </button>
      </nav>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={overlayContainer}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 flex flex-col bg-oxidized-graphite md:hidden"
          >
            <div className="flex flex-1 flex-col items-center justify-center gap-9">
              {t.nav.links.map((link) => (
                <motion.a
                  key={link.href}
                  variants={overlayItem}
                  href={link.href}
                  onClick={closeMenu}
                  className="nav-link font-copperplate text-2xl uppercase tracking-[0.12em] text-bone-porcelain/85"
                >
                  {link.label}
                </motion.a>
              ))}
            </div>

            {/* Social icons — towards the bottom */}
            <motion.ul
              variants={overlayItem}
              className="flex flex-wrap items-center justify-center gap-7 px-6 pb-14"
            >
              {t.about.social.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noreferrer"
                    onClick={closeMenu}
                    aria-label={link.label}
                    className="block text-bone-porcelain/65 transition-colors duration-300 hover:text-synthetic-flesh"
                  >
                    <SocialIcon label={link.label} className="h-6 w-6" />
                  </a>
                </li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
