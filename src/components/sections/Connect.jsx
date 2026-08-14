'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
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
    <span className="font-neue-haas-display text-[16px] uppercase leading-none tracking-[0.30em] text-bone-porcelain/80">
      {c.sectionLabel}
    </span>
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
      className="relative min-h-[100svh] w-full overflow-hidden bg-oxidized-graphite text-bone-porcelain lg:h-full lg:min-h-0"
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
          <motion.div variants={fadeInUp} className="flex items-start gap-7">
            {plate}
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
          at the mobile body size. */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="flex min-h-[100svh] flex-col justify-center gap-7 px-6 py-24 lg:hidden"
      >
        <motion.div variants={fadeInUp} className="flex items-center gap-5">
          {plate}
          <ShimmerLine tone="light" orientation="horizontal" className="w-16" />
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
      </motion.div>
    </section>
  )
}
