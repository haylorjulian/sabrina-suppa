'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useNav } from '@/hooks/useNav'
import { useLanguage } from '@/hooks/useLanguage'
import { useNavTheme } from '@/components/NavThemeProvider'
import { setSectionTarget } from '@/lib/sectionTarget'
import { DURATION } from '@/components/ui/ScrollStage'
import { SocialIcon } from '@/components/ui/icons'

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
  const pathname = usePathname()

  // Lock page scroll while the full-screen menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // The nav is mounted globally. `theme`/`section` are only driven by ScrollStage
  // on home (and persist stale after navigating away), so off the home route we
  // ignore them: project pages are dark-world, and the desktop ProjectHeader owns
  // the top bar there — so the global bar steps aside at md+ and only its mobile
  // hamburger remains.
  const isHome = pathname === '/'
  const isDark = isHome ? theme === 'dark' : true
  const barDark = isDark || open

  // Home hash links (#work) only resolve on the home route; from any other page
  // they must jump home first (/#work) and hand the target section off to the
  // home page via setSectionTarget (see sectionTarget.js).
  const resolveHref = (href) => (isHome || !href.startsWith('#') ? href : `/${href}`)
  const handleNavClick = (href) => {
    if (!isHome && href.startsWith('#')) setSectionTarget(href.slice(1))
    closeMenu()
  }

  // Every project, grouped by category, for the mobile menu's project index.
  const projectGroups = t.work.categories.map((cat) => ({
    label: cat.label,
    projects: cat.projects.map((p) => ({
      href: `/work/${cat.slug}/${p.slug}`,
      title: p.title,
    })),
  }))
  const linkColor = barDark
    ? 'text-bone-porcelain/65 hover:text-bone-porcelain'
    : 'text-oxidized-graphite/55 hover:text-oxidized-graphite'
  const hamColor = barDark ? 'bg-bone-porcelain' : 'bg-oxidized-graphite'

  // The wordmark inverts against the section theme, but only from lg up: that's
  // where Work and About become two-column splits and it sits over the opposite
  // half from the links (Work's dark image, About's grey gradient). Below lg the
  // sections are full-bleed dark, so it follows the bar or it would vanish.
  // Keyed off `theme`, not `barDark` — the latter also goes true for the open
  // mobile menu, which would wrongly flip it at lg if the viewport were resized.
  // Mobile is full opacity (no /NN alpha) per the wordmark's mobile styling;
  // desktop keeps its original translucency via the lg: override below.
  const logoColor = [
    barDark ? 'text-bone-porcelain' : 'text-oxidized-graphite',
    isDark ? 'lg:text-oxidized-graphite/75' : 'lg:text-bone-porcelain/80',
  ].join(' ')

  // On home the hero owns its own chrome, so the bar steps aside there — fading
  // against the stage's crossfade so the two move as one. Off home the desktop
  // ProjectHeader owns the top, so the bar hides from md up and only its mobile
  // hamburger shows. `invisible` (not just opacity) takes the links out of the
  // focus order while they're hidden.
  const barHiddenClass = isHome
    ? section === 'home'
      ? 'lg:invisible lg:opacity-0'
      : ''
    : 'md:invisible md:opacity-0'

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        style={{ transitionDuration: `${DURATION}s`, transitionTimingFunction: 'var(--ease-signature)' }}
        className={`flex items-center justify-between px-6 py-7 transition-[opacity,visibility] md:px-[52px] ${barHiddenClass}`}
      >
        <a
          href={isHome ? '#home' : '/'}
          onClick={closeMenu}
          aria-label={t.nav.logoFull}
          className={`font-ivyora-display font-light lg:font-thin text-[14px] uppercase tracking-[6px] lg:tracking-[8px] lg:opacity-80 transition-colors duration-300 ${logoColor}`}
        >
          {t.nav.logoFull}
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-9 md:flex">
          {t.nav.links.map((link) => (
            <a
              key={link.href}
              href={resolveHref(link.href)}
              onClick={() => handleNavClick(link.href)}
              className={`nav-link font-neue-haas-display text-[14px] uppercase tracking-[0.20em] transition-colors duration-300 ${linkColor}`}
            >
              {link.label}
            </a>
          ))}
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

      {/* Full-screen mobile menu — the site's single wayfinding surface on
          mobile: section links up top, then every project grouped by category,
          then socials. Spacing is tuned to fit the current project count on one
          screen (iPhone 14 and up); overflow-y-auto is a safety net if the CMS
          project list grows past that. */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={overlayContainer}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 overflow-y-auto bg-oxidized-graphite md:hidden"
          >
            <div className="flex min-h-full flex-col gap-6 px-6 pb-8 pt-20">
              {/* Navigation — section links + project index, centred as a group
                  in the space above the socials. flex-1 claims the remaining
                  height so the group centres regardless of viewport size, while
                  the socials below stay pinned to the bottom. */}
              <div className="flex flex-1 flex-col items-center justify-center gap-6">
                {/* Primary section links */}
                <div className="flex flex-col items-center gap-4">
                  {t.nav.links.map((link) => (
                    <motion.a
                      key={link.href}
                      variants={overlayItem}
                      href={resolveHref(link.href)}
                      onClick={() => handleNavClick(link.href)}
                      className="nav-link font-neue-haas-display text-xl uppercase tracking-[0.12em] text-bone-porcelain/85"
                    >
                      {link.label}
                    </motion.a>
                  ))}
                </div>

                {/* Project index — styled distinctly from the section links above:
                    dimmed category labels over italic project titles (echoing the
                    desktop ProjectNav rail). The current project gets the one rare
                    accent as a tick, never a fill (DESIGN.md). */}
                <div className="flex flex-col gap-6">
                  {projectGroups.map((group) => (
                    <motion.div
                      key={group.label}
                      variants={overlayItem}
                      className="flex flex-col items-center gap-3"
                    >
                      <span className="font-neue-haas-display text-[11px] uppercase tracking-[0.24em] text-bone-porcelain/40">
                        {group.label}
                      </span>
                      <ul className="flex flex-col items-center gap-2">
                        {group.projects.map((p) => {
                          const active = pathname === p.href
                          return (
                            <li key={p.href}>
                              <Link
                                href={p.href}
                                onClick={closeMenu}
                                aria-current={active ? 'page' : undefined}
                                className={`flex items-center gap-3 font-neue-haas-display text-base font-light italic transition-colors duration-300 ${
                                  active
                                    ? 'text-bone-porcelain'
                                    : 'text-bone-porcelain/55 hover:text-bone-porcelain/85'
                                }`}
                              >
                                {p.title}
                                {active && <span aria-hidden="true" className="h-px w-6 bg-synthetic-flesh" />}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Social icons — pinned to the bottom */}
              <motion.ul
                variants={overlayItem}
                className="mt-auto flex flex-wrap items-center justify-center gap-7 pt-2"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
