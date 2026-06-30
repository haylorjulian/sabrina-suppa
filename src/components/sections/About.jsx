'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { assets } from '@/lib/assets'
import { useLanguage } from '@/hooks/useLanguage'
import { useNavTheme } from '@/components/NavThemeProvider'
import { SocialIcon } from '@/components/ui/icons'
import FitBox from '@/components/work/FitBox'

const EASE = [0.22, 1, 0.36, 1]

// About section: the Work two-column layout, mirrored. Left = a centred,
// shrink-to-fit box with the bio + socials; right = full-height image with the
// section name centred over it.
export default function About() {
  const { t } = useLanguage()
  const c = t.about
  const { setTheme } = useNavTheme()

  useEffect(() => {
    setTheme('light')
  }, [setTheme])

  return (
    <section
      id="about"
      data-nav-theme="light"
      aria-label="About"
      className="relative h-full w-full overflow-hidden bg-bone-porcelain text-oxidized-graphite"
    >
      <div className="grid h-full grid-cols-1 lg:grid-cols-[50%_50%]">
        {/* Left — content in a centred, shrink-to-fit box (75% of the panel) */}
        <div className="relative h-full">
          <FitBox className="absolute left-1/2 top-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2">
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
                <p key={i} className="body-copy whitespace-pre-line font-light text-oxidized-graphite/70">
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
          </FitBox>
        </div>

        {/* Right — full-viewport-height image, with the section name centred over
            it (mirrors the Work category title) */}
        <div className="relative hidden h-full lg:block">
          <Image
            src={assets.about.background}
            alt={c.bgAlt}
            fill
            sizes="50vw"
            className="object-cover"
          />
          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6 text-center font-copperplate text-[clamp(24px,3.4vw,50px)] uppercase leading-[1.1] tracking-[0.08em] text-synthetic-flesh [text-shadow:0_2px_18px_rgba(26,26,28,0.55)]"
          >
            {c.sectionLabel}
          </motion.h2>
        </div>
      </div>
    </section>
  )
}
