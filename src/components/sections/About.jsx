'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { assets } from '@/lib/assets'
import { useLanguage } from '@/hooks/useLanguage'
import { staggerContainer, fadeInUp } from '@/lib/animations'
import ShimmerLine from '@/components/ui/ShimmerLine'

const EASE = [0.22, 1, 0.36, 1]

// About section: the Work two-column layout, mirrored. Left = a centred,
// shrink-to-fit box with the bio; right = full-height image with the section
// name centred over it. The social links used to close this column and now live
// on Connect (see Connect.jsx), which is where the site asks to be contacted.
// `sectionId` is set only by the mobile tree (see Hero) so the nav's #about
// anchor resolves to the visible section without duplicating ids across trees.
export default function About({ sectionId }) {
  const { t } = useLanguage()
  const c = t.about

  // The nav colour theme is owned solely by SectionStage (it maps this section's
  // index → its theme); sections must not set it themselves, or their mount
  // effects race the stage on first paint. The data-nav-theme marker below stays
  // as the declarative source of truth.
  //
  // "dark" describes what sits *under the bar*, not the section's ground: the
  // links ride the right column's image, so they render light. The left column's
  // grey gradient is why the wordmark inverts against this (see Nav.jsx).
  return (
    <section
      id={sectionId}
      data-nav-theme="dark"
      aria-label="About"
      className="section-fullscreen relative flex w-full flex-col overflow-hidden bg-bone-porcelain text-oxidized-graphite lg:h-full lg:min-h-0"
    >
      {/* Desktop (≥1024px) — mirrored two-column: content left, image right */}
      <div className="hidden h-full flex-1 grid-cols-[50%_50%] lg:grid">
        {/* Left — content-sized box, centred in the column. Width is capped at the
            same fixed measure as Work (~60ch) so line lengths and spacing hold at
            every viewport size. Fixed type (shared with Work), no scaling. */}
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#86858b] to-[#b7b7b7]">
          <div className="flex w-[min(60ch,75%)] flex-col">
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="font-neue-haas-display text-[13px] uppercase tracking-[0.28em] text-oxidized-graphite/80"
            >
              {c.sectionLabel}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              className="mt-8 space-y-3"
            >
              {/* Editor prose: bold / italic / links are rendered to HTML at
                  build time (scripts/build-content.mjs), which also turns the
                  line breaks into <br> — hence no whitespace-pre-line here. */}
              {c.paragraphsHtml.map((para, i) => (
                <p
                  key={i}
                  className="section-desc rich-text font-light text-oxidized-graphite/70"
                  dangerouslySetInnerHTML={{ __html: para }}
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right — full-viewport-height image */}
        <div className="relative hidden h-full lg:block">
          <Image
            src={assets.about.background}
            alt={c.bgAlt}
            fill
            sizes="50vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Mobile (<1024px) — the same cover + docked sheet as the Work categories
          (see WorkCategoryPanel.jsx), with the sheet permanently open: one body
          of copy here and no second state to reveal, so it carries no toggle and
          no action row — the shimmer rule above the title stays as trim, which
          is what it is on the category sheets too now that they have no gesture.
          The copy sits on the sheet's own ground rather than over the
          photograph, so the functional text-shadows this block used to need are
          gone with it.
          The sheet sits on the panel's bottom edge and stays there: the stage
          doesn't scroll, so the phone's URL bar never retracts and there is no
          moving chrome left to compensate for. */}
      <div className="section-fullscreen relative flex flex-col overflow-hidden bg-oxidized-graphite lg:hidden">
        {/* Cover takes whatever the sheet leaves, down to a floor. Past that the
            section grows taller than the panel and PanelScroll takes the
            overflow. That used to be the page's job, and a nested scroll region
            was rejected because it would have fought the page scroll for the same
            drag — there is no page scroll left to fight, and on a short phone
            this bio needs the region (see PanelScroll). */}
        <div className="relative min-h-[32vh] flex-1">
          {/* backgroundMobile falls back to the desktop image at build time when
              the editor leaves it blank (see scripts/build-content.mjs). */}
          <Image src={assets.about.backgroundMobile} alt={c.bgAlt} fill sizes="100vw" className="object-cover" />
          {/* The category covers' scrim, at full strength: bottom-weighted, and
              light enough at the top that the photograph reads untouched. */}
          <div className="absolute inset-0 bg-gradient-to-t from-oxidized-graphite/50 to-oxidized-graphite/5 to-50%" />
          {/* Top seam fade — resets to the dark world under the porcelain sheet
              that now ends the Physical Works cover above, so the section change
              reads as a fade rather than a hard line. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-oxidized-graphite to-transparent" />
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          style={{ backgroundColor: 'rgba(26,26,28,0.86)', borderTopColor: 'rgba(243,238,232,0.18)' }}
          className="relative z-10 flex flex-col gap-[18px] border-t px-6 pb-[max(46px,env(safe-area-inset-bottom))] pt-6"
        >
          {/* The sheet's shimmer rule. There is no second state here, so it
              rides the entrance stagger with everything else rather than
              tracking one the way the category sheets' rule does. */}
          <motion.span variants={fadeInUp} className="block">
            <ShimmerLine tone="light" orientation="horizontal" className="w-[34px]" />
          </motion.span>

          {/* Same size as the category sheets' titles (see WorkCategoryPanel):
              this sheet is the same object as theirs, so its heading sits at the
              same step rather than taking a size of its own. */}
          <motion.h2
            variants={fadeInUp}
            className="font-ivyora-display font-thin text-[1.5rem] uppercase leading-[1.1] tracking-[0.06em] text-[#D8D4CF]"
          >
            {c.sectionLabel}
          </motion.h2>

          <motion.div variants={fadeInUp} className="max-w-[46ch] space-y-3">
            {c.paragraphsMobileHtml.map((para, i) => (
              <p
                key={i}
                className="body-copy rich-text font-light text-[#D8D4CF]/80"
                dangerouslySetInnerHTML={{ __html: para }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
