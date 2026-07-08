'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { assets } from '@/lib/assets'
import { useLanguage } from '@/hooks/useLanguage'
import { SocialIcon } from '@/components/ui/icons'
import { staggerContainer, fadeInUp } from '@/lib/animations'

const EASE = [0.22, 1, 0.36, 1]

// About section: the Work two-column layout, mirrored. Left = a centred,
// shrink-to-fit box with the bio + socials; right = full-height image with the
// section name centred over it.
// `sectionId` is set only by the mobile tree (see Hero) so the nav's #about
// anchor resolves to the visible section without duplicating ids across trees.
export default function About({ sectionId }) {
  const { t } = useLanguage()
  const c = t.about

  // The nav colour theme is owned solely by ScrollStage (it maps this section's
  // index → its theme); sections must not set it themselves, or their mount
  // effects race the stage on first paint. The data-nav-theme marker below stays
  // as the declarative source of truth.
  return (
    <section
      id={sectionId}
      data-nav-theme="light"
      aria-label="About"
      className="relative min-h-[100svh] w-full overflow-hidden bg-bone-porcelain text-oxidized-graphite lg:h-full lg:min-h-0"
    >
      {/* Desktop (≥1024px) — mirrored two-column: content left, image right */}
      <div className="hidden h-full grid-cols-[50%_50%] lg:grid">
        {/* Left — content-sized box, centred in the column. Width is capped at the
            same fixed measure as Work (~60ch) so line lengths and spacing hold at
            every viewport size. Fixed type (shared with Work), no scaling. */}
        <div className="flex h-full items-center justify-center">
          <div className="flex w-[min(60ch,75%)] flex-col">
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="font-copperplate text-[11px] uppercase tracking-[0.28em] text-oxidized-graphite/80"
            >
              {c.sectionLabel}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              className="mt-8 space-y-3"
            >
              {c.paragraphs.map((para, i) => (
                <p key={i} className="section-desc whitespace-pre-line font-light text-oxidized-graphite/70">
                  {para}
                </p>
              ))}
            </motion.div>

            <motion.ul
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
              className="mt-8 flex flex-wrap items-center gap-6"
            >
              {c.social.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noreferrer"
                    aria-label={link.label}
                    className="block text-oxidized-graphite/60 transition-colors duration-300 hover:text-synthetic-flesh"
                  >
                    <SocialIcon label={link.label} className="h-[22px] w-[22px]" />
                  </a>
                </li>
              ))}
            </motion.ul>
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

      {/* Mobile (<1024px) — full-bleed image cover with the bio + socials read as
          natural flowing text (no FitBox scaling). */}
      <div className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-oxidized-graphite text-bone-porcelain lg:hidden">
        <Image src={assets.about.background} alt={c.bgAlt} fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-oxidized-graphite/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-oxidized-graphite via-oxidized-graphite/80 to-transparent" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="relative z-10 flex flex-col gap-6 px-6 pb-20 pt-28"
        >
          <motion.h2
            variants={fadeInUp}
            className="font-copperplate text-[clamp(30px,9vw,46px)] uppercase leading-[1.1] tracking-[0.06em] text-bone-porcelain [text-shadow:0_2px_18px_rgba(26,26,28,0.6)]"
          >
            {c.sectionLabel}
          </motion.h2>

          <motion.div variants={fadeInUp} className="max-w-[46ch] space-y-3">
            {c.paragraphs.map((para, i) => (
              <p key={i} className="body-copy whitespace-pre-line font-light text-bone-porcelain/85">
                {para}
              </p>
            ))}
          </motion.div>

          <motion.ul variants={fadeInUp} className="flex flex-wrap items-center gap-7 pt-2">
            {c.social.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noreferrer"
                  aria-label={link.label}
                  className="block text-bone-porcelain/70 transition-colors duration-300 hover:text-synthetic-flesh"
                >
                  <SocialIcon label={link.label} className="h-6 w-6" />
                </a>
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  )
}
