'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { categoryImages } from '@/lib/assets'
import { staggerContainer, fadeInUp } from '@/lib/animations'
import ShimmerArrow from '@/components/ui/ShimmerArrow'

// Mobile Work (below lg): one full-screen cover per category, stacked in order
// (Adaptive Flesh → Physical Works). Each cover is the category image full-bleed
// with the name, its description, and a "See Projects" cue that jumps straight
// to the first project's gallery. Natural vertical scroll — no in-page toggle.
export default function WorkMobile() {
  const { t } = useLanguage()
  const c = t.work

  return (
    // id + scroll-mt (globals) let the nav's #work link land here under the bar.
    <section id="work" aria-label="Work" className="lg:hidden">
      {c.categories.map((cat) => {
        const first = cat.projects[0]
        const image = categoryImages[cat.slug]?.mobile

        // Editors pick the overlay text colour per category (dark for light
        // images, light for dark ones). A functional text-shadow — the only kind
        // allowed (DESIGN.md) — keeps the copy legible now that the image carries
        // no scrim behind it.
        const dark = cat.overlayTextColor === 'dark'
        const overlayText = dark ? 'text-oxidized-graphite' : 'text-bone-porcelain'
        const overlayShadow = dark
          ? '[text-shadow:0_2px_18px_rgba(243,238,232,0.65)]'
          : '[text-shadow:0_2px_18px_rgba(26,26,28,0.6)]'

        return (
          <article
            key={cat.slug}
            className="relative flex min-h-[100svh] w-full flex-col justify-end overflow-hidden bg-oxidized-graphite"
          >
            {image && (
              <Image src={image} alt={cat.label} fill sizes="100vw" className="object-cover" />
            )}

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              className="relative z-10 flex flex-col gap-6 px-6 pb-20 pt-28"
            >
              <motion.h2
                variants={fadeInUp}
                className={`font-ivyora-display font-thin text-[clamp(30px,9vw,46px)] uppercase leading-[1.1] tracking-[0.06em] ${overlayText} ${overlayShadow}`}
              >
                {cat.label}
              </motion.h2>

              <motion.p
                variants={fadeInUp}
                className={`body-copy max-w-[46ch] whitespace-pre-line font-light ${dark ? 'text-oxidized-graphite/85' : 'text-bone-porcelain/85'} ${overlayShadow}`}
              >
                {cat.descriptionMobile}
              </motion.p>

              <motion.div variants={fadeInUp} className="pt-2">
                <Link
                  href={`/work/${cat.slug}/${first.slug}`}
                  className={`group inline-flex items-center gap-3 font-neue-haas-display text-[13px] uppercase tracking-[0.18em] ${overlayText} ${overlayShadow}`}
                >
                  {c.seeProjects}
                  <ShimmerArrow
                    tone={dark ? 'dark' : 'light'}
                    className="h-3 w-9 -translate-x-[5px] transition-transform duration-300 group-hover:translate-x-[-1px]"
                  />
                </Link>
              </motion.div>
            </motion.div>
          </article>
        )
      })}
    </section>
  )
}
