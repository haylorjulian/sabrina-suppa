'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNav } from '@/hooks/useNav'
import { useLanguage } from '@/hooks/useLanguage'
import { mobileMenu } from '@/lib/animations'
import LangToggle from './LangToggle'

// Single fixed nav shared across all sections. Its colour theme adapts to the
// section currently under the bar — sections declare data-nav-theme="dark|light"
// (dark bg → light text, light bg → dark text).
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

  const isDark = theme === 'dark'
  const linkColor = isDark
    ? 'text-bone-porcelain/65 hover:text-bone-porcelain'
    : 'text-oxidized-graphite/55 hover:text-oxidized-graphite'
  const logoColor = isDark ? 'text-bone-porcelain/55' : 'text-oxidized-graphite/45'
  const barColor = isDark ? 'bg-bone-porcelain' : 'bg-oxidized-graphite'

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="flex items-center justify-between px-6 py-7 md:px-[52px]">
        <a
          href="#home"
          onClick={closeMenu}
          className={`text-[11px] uppercase tracking-[0.30em] transition-colors duration-300 ${logoColor}`}
        >
          {t.nav.logo}
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {t.nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-[10px] uppercase tracking-[0.22em] transition-colors duration-300 ${linkColor}`}
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
          className="flex h-5 w-6 flex-col justify-center gap-[5px] md:hidden"
        >
          <span className={`block h-px w-full transition-transform duration-300 ${barColor} ${open ? 'translate-y-[3px] rotate-45' : ''}`} />
          <span className={`block h-px w-full transition-transform duration-300 ${barColor} ${open ? '-translate-y-[3px] -rotate-45' : ''}`} />
        </button>
      </nav>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={mobileMenu}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-x-0 top-full mx-6 flex flex-col items-start gap-6 border-t border-bone-porcelain/10 bg-oxidized-graphite/95 px-6 py-8 backdrop-blur-sm md:hidden"
          >
            {t.nav.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="text-sm uppercase tracking-[0.22em] text-bone-porcelain/80"
              >
                {link.label}
              </a>
            ))}
            <LangToggle theme="dark" className="pl-0 border-l-0" />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
