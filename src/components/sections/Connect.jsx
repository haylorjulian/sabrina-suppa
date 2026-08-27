'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { SocialIcon } from '@/components/ui/icons'
import { staggerContainer, fadeInUp } from '@/lib/animations'
import ShimmerLine from '@/components/ui/ShimmerLine'

// Connect: the fourth full-viewport section — text only, no imagery, no footer
// strip. Dark world throughout, so the global Nav floats over it unchanged
// (Nav.jsx exempts this section from the wordmark inversion: there is no light
// column under the bar here, unlike Work and About).
//
// `sectionId` is set only by the mobile tree — the desktop tree navigates by
// index through ScrollStage and omits the id to avoid duplicates across trees.
export default function Connect({ sectionId }) {
  const { t } = useLanguage()
  const c = t.connect

  // Hero's wordmark scale, lowercase — the client's preferred treatment over the
  // mock's 32px uppercase. The clamp floors at 24px, which keeps the address on
  // one line down to 375px, so mobile needs no separate size.
  const email = (
    <a
      href={`mailto:${c.email}`}
      className="font-ivyora-display font-thin text-[clamp(24px,3.4vw,37px)] leading-[1.1] tracking-[0.08em] text-bone-porcelain transition-opacity duration-[350ms] [transition-timing-function:var(--ease-signature)] hover:opacity-[0.72] focus-visible:opacity-[0.72]"
    >
      {c.email}
    </a>
  )

  const plate = (
    // Same 16px/1.55 metrics as .section-desc beside it: matching the line box
    // (not just the size) is what puts the plate's first line on the copy's, since
    // an unmatched half-leading offsets one against the other.
    <span className="font-neue-haas-display text-[16px] uppercase leading-[1.55] tracking-[0.30em] text-bone-porcelain/80">
      {c.sectionLabel}
    </span>
  )

  // The social links, moved here from About: Connect is the one place the site
  // asks to be contacted, so the address and every other route out of it read as
  // one block. `direction` is the only difference between the tiers — a column
  // hanging off the label plate on desktop, a row under the copy on mobile.
  //
  // Icons rest at 60% porcelain and hover to synthetic-flesh, which is the one
  // sanctioned use of the accent (DESIGN.md §2) and the treatment they carried
  // on About, so nothing about the links themselves changes — only where they
  // live. They are icon-only, hence aria-label rather than visible text.
  const socials = (direction) => (
    <ul className={`flex ${direction === 'column' ? 'flex-col items-end gap-9' : 'flex-row items-center gap-7'}`}>
      {(c.social ?? []).map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            target={link.href.startsWith('mailto:') ? undefined : '_blank'}
            rel="noreferrer"
            aria-label={link.label}
            className="block text-bone-porcelain/60 transition-colors duration-300 [transition-timing-function:var(--ease-signature)] hover:text-synthetic-flesh focus-visible:text-synthetic-flesh"
          >
            <SocialIcon label={link.label} className="h-[22px] w-[22px]" />
          </a>
        </li>
      ))}
    </ul>
  )

  // `size` is the body class for the tier: the 16px desktop panel measure
  // (.section-desc) or the 15px mobile one (.body-copy).
  const notes = (size) =>
    c.notesHtml.map((note, i) => (
      <p
        key={i}
        className={`${size} rich-text font-light text-bone-porcelain/70`}
        dangerouslySetInnerHTML={{ __html: note }}
      />
    ))

  return (
    <section
      id={sectionId}
      data-nav-theme="dark"
      aria-label="Connect"
      className="section-fullscreen relative w-full snap-start snap-always overflow-hidden bg-oxidized-graphite text-bone-porcelain lg:h-full lg:min-h-0"
    >
      {/* Desktop (≥1024px) — one centred row: the label plate and its rule, then
          the copy column. items-stretch is what lets the rule run the exact
          height of the copy beside it. */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="hidden h-full items-center justify-center px-[52px] lg:flex"
      >
        <div className="flex items-stretch gap-10">
          {/* Label plate + the icon column hang together off the rule, ranged
              right so the icons align to the plate's right edge rather than
              floating in the gutter. The rule keeps running the full height of
              the row, so it now measures against whichever column is taller —
              the copy or this one. */}
          <motion.div variants={fadeInUp} className="flex items-start gap-7">
            <div className="flex flex-col items-end gap-10">
              {plate}
              {socials('column')}
            </div>
            <ShimmerLine tone="light" orientation="vertical" className="self-stretch" />
          </motion.div>

          <div className="flex w-[540px] flex-col gap-[30px]">
            <motion.p
              variants={fadeInUp}
              className="section-desc rich-text font-light text-bone-porcelain/70"
              dangerouslySetInnerHTML={{ __html: c.introHtml }}
            />
            <motion.div variants={fadeInUp}>{email}</motion.div>
            <motion.div variants={fadeInUp} className="flex flex-col gap-[14px]">
              {notes('section-desc')}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Mobile (<1024px) — same composition ranged left: the plate keeps its
          rule (rather than becoming an ivyora heading), the copy stacks under it
          at the mobile body size.
          Anchored to the bottom edge, like the other mobile sections' docked
          content, and it holds there while the phone's URL bar is showing (see
          .section-fullscreen in globals.css). */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="section-fullscreen flex flex-col justify-end gap-7 px-6 pb-[max(6rem,env(safe-area-inset-bottom))] pt-24 lg:hidden"
      >
        {/* The rule sits above the label rather than beside it, so the block
            opens the way the mobile sheets do (About and the category covers
            both lead with the same short trim over their title). */}
        <motion.div variants={fadeInUp} className="flex flex-col items-start gap-5">
          <ShimmerLine tone="light" orientation="horizontal" className="w-[34px]" />
          {plate}
        </motion.div>

        <motion.p
          variants={fadeInUp}
          className="body-copy rich-text max-w-[46ch] font-light text-bone-porcelain/70"
          dangerouslySetInnerHTML={{ __html: c.introHtml }}
        />
        <motion.div variants={fadeInUp}>{email}</motion.div>
        <motion.div variants={fadeInUp} className="flex max-w-[46ch] flex-col gap-[14px]">
          {notes('body-copy')}
        </motion.div>
        {/* Ranged left in a row here: there is no rule to hang a column off at
            this tier, and a row keeps the icons on the copy's left margin. */}
        <motion.div variants={fadeInUp} className="mt-2">{socials('row')}</motion.div>
      </motion.div>
    </section>
  )
}
