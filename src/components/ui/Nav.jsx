'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useNav } from '@/hooks/useNav'
import { useLanguage } from '@/hooks/useLanguage'
import { useNavTheme } from '@/components/NavThemeProvider'
import { setSectionTarget } from '@/lib/sectionTarget'
import { scrollToSection } from '@/lib/scrollToSection'
import { DURATION } from '@/components/ui/ScrollStage'
import { SocialIcon } from '@/components/ui/icons'
import { staggerContainer, fadeInUp } from '@/lib/animations'

// Single fixed nav shared across all sections. Its colour theme adapts to the
// section currently under the bar — sections declare data-nav-theme="dark|light"
// (dark bg → light text, light bg → dark text).
//
// The bar hides itself on the desktop hero, which carries its own chrome (a right
// rail + footer strip). Below lg there is no stage, so it always shows.
const EASE = [0.22, 1, 0.36, 1]

const overlayContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: EASE, staggerChildren: 0.08, delayChildren: 0.12 },
  },
  exit: { opacity: 0, transition: { duration: 0.25, ease: EASE } },
}
const overlayItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export default function Nav() {
  const { open, toggleMenu, closeMenu } = useNav()
  const { t } = useLanguage()
  const { theme, section } = useNavTheme()
  const pathname = usePathname()
  const hamburgerRef = useRef(null)

  // Lock page scroll while the full-screen menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Escape closes the menu from anywhere while it's open (the focus trap lives
  // with the overlay itself, in MobileMenu).
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, closeMenu])

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

  // On home, below lg, the fragment jump is driven by hand — the page's
  // mandatory snap arrests the browser's own animated scroll partway, which is
  // what made these links land on the wrong section (see scrollToSection).
  // At lg+ ScrollStage intercepts hash clicks itself and there is no page
  // scroll to drive; off home the link is a real navigation and the target
  // section is handed over through sessionStorage instead.
  const handleNavClick = (e, href) => {
    if (!isHome && href.startsWith('#')) setSectionTarget(href.slice(1))
    closeMenu()
    if (!isHome || !href.startsWith('#')) return
    if (window.matchMedia('(min-width: 1024px)').matches) return
    e.preventDefault()
    scrollToSection(href.slice(1))
  }

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
  //
  // Connect is the exception: it's a single dark ground with no light column, so
  // the inversion would paint the wordmark graphite on graphite and it would
  // vanish. It follows the bar there, exactly as the mobile sections do.
  const fullBleedDark = isHome && section === 'connect'
  const logoColor = [
    barDark ? 'text-bone-porcelain' : 'text-oxidized-graphite',
    isDark && !fullBleedDark ? 'lg:text-oxidized-graphite/75' : 'lg:text-bone-porcelain/80',
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
      {/* pt keeps the designed 1.75rem and only grows past it on a notched
          device, where viewport-fit=cover (see layout.jsx) would otherwise let
          the wordmark and hamburger slide under the status bar. Static — the bar
          is not browser-chrome-sensitive and must never move. */}
      <nav
        style={{ transitionDuration: `${DURATION}s`, transitionTimingFunction: 'var(--ease-signature)' }}
        className={`flex items-center justify-between px-6 pb-7 pt-[max(1.75rem,env(safe-area-inset-top))] transition-[opacity,visibility] md:px-[52px] ${barHiddenClass}`}
      >
        <a
          href={isHome ? '#home' : '/'}
          onClick={(e) => handleNavClick(e, isHome ? '#home' : '/')}
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
              onClick={(e) => handleNavClick(e, link.href)}
              className={`nav-link font-neue-haas-display text-[14px] uppercase tracking-[0.20em] transition-colors duration-300 ${linkColor}`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          ref={hamburgerRef}
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
          mobile. Mounted only while open, so its accordion state re-derives
          from the current route every time it appears. */}
      <AnimatePresence>
        {open && (
          <MobileMenu
            key="mobile-menu"
            isHome={isHome}
            resolveHref={resolveHref}
            onNavClick={handleNavClick}
            onClose={closeMenu}
            returnFocusRef={hamburgerRef}
          />
        )}
      </AnimatePresence>
    </header>
  )
}

// The mobile overlay: a three-part flex column — a spacer that reserves the real
// bar above it, the scrolling index, and a fixed base carrying the email and
// socials. Only the middle part scrolls, so no amount of CMS content can push
// the socials off-screen (the flat, fully-expanded index it replaces could).
function MobileMenu({ isHome, resolveHref, onNavClick, onClose, returnFocusRef }) {
  const { t } = useLanguage()
  const pathname = usePathname()
  const reduced = useReducedMotion()
  const overlayRef = useRef(null)

  // Categories, their projects and their counts all come from the content
  // pipeline (src/content/categories/*.json + projects/*.json → build-content.mjs),
  // already ordered by `order`/`projectOrder`. Never a hardcoded list: a category
  // the client adds in the CMS appears here with no code change.
  const categories = t.work.categories.map((cat) => ({
    slug: cat.slug,
    label: cat.label,
    count: cat.projects.length,
    projects: cat.projects.map((p) => ({ href: `/work/${cat.slug}/${p.slug}`, title: p.title })),
  }))

  // Accordion, one open at a time. Opens on the category of the current route
  // (/work/<slug>/<project>), else the first by order.
  const routeCategory = categories.find((c) => pathname.startsWith(`/work/${c.slug}/`))?.slug
  const [openCategory, setOpenCategory] = useState(routeCategory ?? categories[0]?.slug ?? null)

  // The email ships as a text link in its own right here, so it comes out of the
  // icon row rather than being rendered twice.
  const socials = (t.connect.social ?? []).filter((s) => !s.href.startsWith('mailto:'))

  // Which section row reads at full porcelain. NavThemeProvider's `section` is no
  // use here: ScrollStage only drives it from lg up and sets it to null below,
  // which is exactly where this menu lives. Off home we're inside a project, so
  // Works is the section; on home the mobile sections are ordinary full-height
  // elements carrying the same ids the nav links point at, so the one occupying
  // most of the viewport is the one we're on. Measured once on open — the page
  // is scroll-locked behind the overlay, so it cannot change while we're here.
  const [activeHref, setActiveHref] = useState(isHome ? null : '#work')
  useEffect(() => {
    if (!isHome) return
    const vh = window.innerHeight
    let best = null
    let bestVisible = 0
    for (const link of t.nav.links) {
      if (!link.href.startsWith('#')) continue
      const el = document.getElementById(link.href.slice(1))
      if (!el) continue
      const r = el.getBoundingClientRect()
      const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0)
      if (visible > bestVisible) {
        bestVisible = visible
        best = link.href
      }
    }
    setActiveHref(best)
  }, [isHome, t.nav.links])

  // Focus trap. The overlay is the only interactive surface while it's open, so
  // Tab cycles within it and focus returns to the hamburger on close.
  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return
    const returnTo = returnFocusRef.current
    const focusable = () =>
      [...overlay.querySelectorAll('a[href], button:not([disabled])')].filter(
        (el) => el.offsetParent !== null
      )

    focusable()[0]?.focus()

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return
      const items = focusable()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    overlay.addEventListener('keydown', onKeyDown)
    return () => {
      overlay.removeEventListener('keydown', onKeyDown)
      returnTo?.focus()
    }
  }, [returnFocusRef])

  return (
    <motion.div
      ref={overlayRef}
      variants={overlayContainer}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-40 flex flex-col bg-oxidized-graphite md:hidden"
    >
      {/* 1. Bar — reserved, not redrawn: the real <nav> sits at z-50 above this
          overlay with the same px-6 py-7 padding and already carries the
          wordmark and the hamburger's morph to an X. Sizing the spacer off the
          same padding plus the hamburger's own h-5 (the bar's tallest child)
          keeps the two in step without a hardcoded height. */}
      <div aria-hidden="true" className="flex-none px-6 py-7">
        <div className="h-5" />
      </div>

      {/* 2. Index — the only part that scrolls. overscroll-contain stops the
          locked page behind it from rubber-banding at the ends. */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="flex flex-col px-6 pb-7">
          <Rule />
          {t.nav.links.map((link) => (
            <div key={link.href} className="flex flex-col">
              {/* No .nav-link bloom here: its glow is sized to the element, and
                  these rows are full-width for the hit target, so it would wash
                  flesh across the whole row — a fill, which DESIGN.md rules out.
                  The row's state is the porcelain opacity step, as specced. */}
              <motion.a
                variants={overlayItem}
                href={resolveHref(link.href)}
                onClick={(e) => onNavClick(e, link.href)}
                aria-current={activeHref === link.href ? 'true' : undefined}
                className={`block py-[18px] font-neue-haas-display text-base uppercase tracking-[0.12em] transition-colors duration-300 hover:text-bone-porcelain ${
                  activeHref === link.href ? 'text-bone-porcelain' : 'text-bone-porcelain/85'
                }`}
              >
                {link.label}
              </motion.a>

              {/* The category index hangs off the Works row — Works itself stays
                  a plain section link and toggles nothing. */}
              {link.href === '#work' && (
                <motion.div variants={overlayItem} className="flex flex-col pb-2">
                  {categories.map((cat) => (
                    <CategoryRow
                      key={cat.slug}
                      cat={cat}
                      open={openCategory === cat.slug}
                      reduced={reduced}
                      pathname={pathname}
                      onToggle={() =>
                        setOpenCategory((slug) => (slug === cat.slug ? null : cat.slug))
                      }
                      onNavigate={onClose}
                    />
                  ))}
                </motion.div>
              )}

              <Rule />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Base — fixed, so the email and socials survive any amount of work.
          One line: icons left, email right. The email's tracking and size are
          pulled in from the 11px/0.24em of the stacked version so the pair fits
          the 375px reference width without wrapping. */}
      <motion.div
        variants={overlayItem}
        className="flex flex-none items-center justify-between gap-4 border-t border-bone-porcelain/[0.18] px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[26px]"
      >
        <ul className="flex flex-none items-center gap-4">
          {socials.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                onClick={onClose}
                aria-label={link.label}
                className="block text-bone-porcelain/65 transition-colors duration-300 hover:text-synthetic-flesh"
              >
                <SocialIcon label={link.label} className="h-[16.5px] w-[16.5px]" />
              </a>
            </li>
          ))}
        </ul>
        <a
          href={`mailto:${t.connect.email}`}
          onClick={onClose}
          className="whitespace-nowrap font-neue-haas-display text-[10px] uppercase tracking-[0.14em] text-bone-porcelain/65 transition-colors duration-300 hover:text-bone-porcelain"
        >
          {t.connect.email}
        </a>
      </motion.div>
    </motion.div>
  )
}

// Section-row rule. Faint variant separates the category rows nested under Works.
function Rule({ faint = false }) {
  return (
    <div
      aria-hidden="true"
      className={`h-px flex-none ${faint ? 'bg-bone-porcelain/[0.09]' : 'bg-bone-porcelain/[0.18]'}`}
    />
  )
}

// One collapsible category: a labelled row with its project count and a
// plus/minus affordance, over a two-column grid of its projects. State language
// is opacity only, per DESIGN.md — no fills, no shadows.
function CategoryRow({ cat, open, reduced, pathname, onToggle, onNavigate }) {
  const panelId = useId()
  const transition = reduced ? { duration: 0 } : { duration: 0.4, ease: EASE }

  return (
    <>
      <Rule faint />
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={`flex w-full items-center justify-between text-left ${open ? 'pb-3 pt-4' : 'py-4'}`}
      >
        <span className="flex items-start gap-1.5">
          <span
            className={`font-neue-haas-display text-[10.5px] uppercase leading-none tracking-[0.20em] transition-colors duration-300 ${
              open ? 'text-bone-porcelain/85' : 'text-bone-porcelain/60'
            }`}
          >
            {cat.label}
          </span>
          <span className="font-neue-haas-display text-[8px] leading-none tracking-[0.08em] text-bone-porcelain/40">
            ({cat.count})
          </span>
        </span>

        {/* Plus → minus: the vertical rule scales to nothing rather than the
            glyph being swapped, so the mark stays one continuous object. */}
        <span aria-hidden="true" className="relative block h-[13px] w-[13px] flex-none">
          <span className="absolute left-0 top-1.5 h-px w-full bg-bone-porcelain/55" />
          <motion.span
            className="absolute left-1.5 top-0 h-full w-px bg-bone-porcelain/55"
            initial={false}
            animate={{ scaleY: open ? 0 : 1 }}
            transition={transition}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transition}
            className="overflow-hidden"
          >
            <motion.ul
              variants={reduced ? undefined : staggerContainer}
              initial={reduced ? undefined : 'hidden'}
              animate={reduced ? undefined : 'visible'}
              className="grid grid-cols-2 gap-x-4 gap-y-[10px] pb-5"
            >
              {cat.projects.map((p) => {
                const active = pathname === p.href
                return (
                  <motion.li key={p.href} variants={reduced ? undefined : fadeInUp}>
                    <Link
                      href={p.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-2.5 py-1.5 font-neue-haas-display text-[13px] font-light italic leading-[1.35] transition-colors duration-300 ${
                        active
                          ? 'text-bone-porcelain'
                          : 'text-bone-porcelain/55 hover:text-bone-porcelain/85'
                      }`}
                    >
                      {p.title}
                      {active && (
                        <span aria-hidden="true" className="h-px w-[18px] flex-none bg-bone-porcelain" />
                      )}
                    </Link>
                  </motion.li>
                )
              })}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
