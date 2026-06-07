'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNav } from '@/hooks/useNav'
import { useLanguage } from '@/hooks/useLanguage'
import LangToggle from './LangToggle'

// Single fixed nav shared across all sections. Its colour theme adapts to the
// section currently under the bar — sections declare data-nav-theme="dark|light"
// (dark bg → light text, light bg → dark text).
const overlayContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: {},
}
const overlayItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export default function Nav() {
  const { open, toggleMenu, closeMenu } = useNav()
  const { t } = useLanguage()
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('[data-nav-theme]'))
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTheme(entry.target.getAttribute('data-nav-theme') || 'dark')
          }
        })
      },
      // Trigger when a section crosses the top band of the viewport.
      { rootMargin: '-10% 0px -85% 0px', threshold: 0 }
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  // Lock page scroll while the full-screen menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const isDark = theme === 'dark'
  // While the (dark) overlay is open, force the bar to its light-on-dark treatment.
  const barDark = isDark || open
  const linkColor = barDark
    ? 'text-bone-porcelain/65 hover:text-bone-porcelain'
    : 'text-oxidized-graphite/55 hover:text-oxidized-graphite'
  const logoColor = barDark ? 'text-bone-porcelain/55' : 'text-oxidized-graphite/45'
  const hamColor = barDark ? 'bg-bone-porcelain' : 'bg-oxidized-graphite'

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="flex items-center justify-between px-6 py-7 md:px-[52px]">
        <a
          href="#home"
          onClick={closeMenu}
          className={`text-[14px] uppercase tracking-[0.28em] transition-colors duration-300 ${logoColor}`}
        >
          {t.nav.logo}
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-9 md:flex">
          {t.nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-[14px] uppercase tracking-[0.20em] transition-colors duration-300 ${linkColor}`}
            >
              {link.label}
            </a>
          ))}
          <LangToggle theme={theme} />
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
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-9 bg-oxidized-graphite md:hidden"
          >
            {t.nav.links.map((link) => (
              <motion.a
                key={link.href}
                variants={overlayItem}
                href={link.href}
                onClick={closeMenu}
                className="text-3xl font-extralight italic tracking-[0.04em] text-bone-porcelain/85"
              >
                {link.label}
              </motion.a>
            ))}
            <motion.div variants={overlayItem} className="mt-2">
              <LangToggle theme="dark" className="border-l-0 pl-0 text-xs" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
