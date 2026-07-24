'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { assets } from '@/lib/assets'
import { useLanguage } from '@/hooks/useLanguage'
import { usePreloaderState } from '@/components/PreloaderProvider'
import { staggerContainer, fadeInUp } from '@/lib/animations'
import ShimmerLine from '@/components/ui/ShimmerLine'
import Footer from '@/components/ui/Footer'
import { InstagramIcon } from '@/components/ui/icons'

// `sectionId` is set only by the mobile tree so the nav's #home anchor resolves
// to the visible section — the desktop tree navigates by index (ScrollStage) and
// omits the id to avoid duplicate ids across the two trees.
export default function Hero({ sectionId }) {
  const { t } = useLanguage()
  const { loading } = usePreloaderState()
  const c = t.hero
  const shadow = '[text-shadow:0_1px_8px_rgba(26,26,28,0.7)]'
  const linkColor = 'text-bone-porcelain/65 transition-colors duration-300 hover:text-bone-porcelain'
  const socialHref = (label) => t.about.social.find((s) => s.label === label)?.href || '#'
  // Connect is hero-only; the shared list stays the source of truth for the three
  // section hrefs, which must track ScrollStage's ids.
  const railLinks = [...t.nav.links, c.connect]

  return (
    <section
      id={sectionId}
      data-nav-theme="dark"
      aria-label="Hero"
      className="relative min-h-[100svh] w-full overflow-hidden bg-wet-petroleum lg:h-full lg:min-h-0"
    >
        {/* Background scaled to fill, centred. The source is a 2x master (3840x2160),
            so covering the frame spends those pixels on retina sharpness rather
            than on size. This replaced object-none, which painted the file 1:1 with
            no resampling: that only held while the source matched the viewport 1:1,
            and against a 2x master it renders as a centre-crop zoom. The
            wet-petroleum ground below is now only seen if the image fails to load.
            No filters/shadows touch it. */}
        <Image
          src={assets.hero.background}
          alt={c.bgAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Mobile chrome — scroll cue, wordmark, then the footer strip, stacked
            across the hero's lower half (the desktop tier reads its rail + its
            own footer strip instead). Mirrors the desktop hero's bottom-anchored
            composition and reuses the shared footer for parity with the project
            pages. */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={loading ? 'hidden' : 'visible'}
          className="absolute inset-x-0 bottom-0 top-1/2 z-10 flex flex-col items-center justify-between px-6 pb-6 text-center lg:hidden"
        >
          {/* Scroll cue */}
          <motion.div variants={fadeInUp} className="flex flex-col items-center gap-[10px]">
            <span className={`vertical-text text-[12px] uppercase tracking-[0.30em] text-bone-porcelain/75 ${shadow}`}>
              {c.scroll}
            </span>
            <ShimmerLine tone="light" className="h-16" />
          </motion.div>

          {/* Footer — same responsive strip as the project pages, tightened to
              sit closer to the hero's bottom edge */}
          <motion.div variants={fadeInUp} className="w-full">
            <Footer shadow rowPadding="pt-[18px] pb-0" />
          </motion.div>
        </motion.div>

        {/* Desktop chrome — the hero carries its own, so the nav bar hides here.
            The wrapper spans the section to stagger everything as one entrance;
            it stays click-through so only the rail and footer take the pointer. */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={loading ? 'hidden' : 'visible'}
          className="pointer-events-none absolute inset-0 z-10 hidden lg:block"
        >
          {/* Wordmark, off-axis bottom-left. bottom-[81px] = the 60px footer strip
              + the 21px HERO_GAP, so it clears the rule by the same step the strip
              centres the footer row on. */}
          <motion.h1
            variants={fadeInUp}
            className={`absolute bottom-[81px] left-[32px] font-ivyora-display font-thin text-[clamp(24px,3.4vw,37px)] leading-[1.1] tracking-[0.08em] text-bone-porcelain ${shadow}`}
          >
            {c.name}
          </motion.h1>

          {/* Right rail. Height is measured off the midpoint so the icon sits at
              50% and the links stay clear of the footer as the viewport grows — a
              bottom-anchored stack would let the icon drift. min-h-fit is what
              keeps it honest when short: once the contents no longer fit between
              the midpoint and the footer, the rail grows upward past 50% instead
              of overflowing down through the footer strip. gap is the floor on
              that squeeze; justify-between spends any surplus on top of it. */}
          <motion.div
            variants={fadeInUp}
            className="pointer-events-auto absolute bottom-[81px] right-[32px] flex h-[calc(50%-81px)] min-h-fit flex-col items-end justify-between gap-[21px]"
          >
            {/* Icon and line ride one 19px column, so they share a centre axis —
                the rail is items-end, so aligning their edges instead would leave
                the line hanging off the icon's right shoulder. Grouping them also
                pins the gap: as separate justify-between children their spacing
                came out of leftover space and drifted with viewport height. */}
            <div className="flex w-[19px] shrink-0 flex-col items-center gap-[62px]">
              <a
                href={socialHref('Instagram')}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className={linkColor}
              >
                <InstagramIcon className="h-[19px] w-[19px]" />
              </a>
              {/* shrink-0: a fixed-height span in a flex column gets crushed otherwise */}
              <ShimmerLine tone="light" className="h-28 shrink-0" />
            </div>

            <nav aria-label="Hero" className="flex flex-col items-end gap-[14px]">
              {railLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`nav-link font-neue-haas-display text-[13px] uppercase tracking-[0.24em] ${linkColor} ${shadow}`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </motion.div>

          {/* Footer strip. Rule runs inset-to-inset, holding the hero's chrome line.
              Pinned to the viewport bottom with equal padding above and below the
              row, so the text is centred between the rule and the bottom edge by
              construction — HERO_GAP is the hero's one vertical rhythm value, and
              it also sets the space above the rule (see the wordmark and rail). */}
          <motion.div
            variants={fadeInUp}
            className="pointer-events-auto absolute inset-x-[32px] bottom-0"
          >
            <Footer shadow />
          </motion.div>
        </motion.div>
    </section>
  )
}
