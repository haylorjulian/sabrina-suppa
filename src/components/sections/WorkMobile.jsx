'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { categoryImages } from '@/lib/assets'
import { staggerContainer, fadeInUp } from '@/lib/animations'

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
        const image = categoryImages[cat.slug]?.vertical

        return (
          <article
            key={cat.slug}
            className="relative flex min-h-[100svh] w-full flex-col justify-end overflow-hidden bg-oxidized-graphite"
          >
            {image && (
              <Image src={image} alt={cat.label} fill sizes="100vw" className="object-cover" />
            )}

            {/* Base scrim guarantees body-copy contrast anywhere over the image;
                the bottom gradient deepens it under the anchored text block. */}
            <div className="absolute inset-0 bg-oxidized-graphite/45" />
            <div className="absolute inset-0 bg-gradient-to-t from-oxidized-graphite via-oxidized-graphite/75 to-transparent" />

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
                {cat.label}
              </motion.h2>

              <motion.div variants={fadeInUp} className="max-w-[46ch] space-y-3">
                {(cat.description || []).map((para, i) => (
                  <p
                    key={i}
                    className="body-copy whitespace-pre-line font-light text-bone-porcelain/85"
                  >
                    {para}
                  </p>
                ))}
              </motion.div>

              <motion.div variants={fadeInUp} className="pt-2">
                <Link
                  href={`/work/${cat.slug}/${first.slug}`}
                  className="group inline-flex items-center gap-3 border-b border-bone-porcelain/30 pb-2 font-copperplate text-[12px] uppercase tracking-[0.24em] text-bone-porcelain transition-colors duration-300 hover:border-bone-porcelain"
                >
                  {c.seeProjects}
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </article>
        )
      })}
    </section>
  )
}
