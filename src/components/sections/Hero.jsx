'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { assets } from '@/lib/assets'
import { useLanguage } from '@/hooks/useLanguage'
import { usePreloader } from '@/hooks/usePreloader'
import { staggerContainer, fadeInUp } from '@/lib/animations'
import Preloader from '@/components/ui/Preloader'
import ShimmerLine from '@/components/ui/ShimmerLine'

// `sectionId` is set only by the mobile tree so the nav's #home anchor resolves
// to the visible section — the desktop tree navigates by index (ScrollStage) and
// omits the id to avoid duplicate ids across the two trees.
export default function Hero({ sectionId }) {
  const { t } = useLanguage()
  const { loading } = usePreloader()
  const c = t.hero
  // "Body Architect · Exploring Adaptive Morphologies" → two lines on mobile
  const descParts = c.descriptor.split(' · ')
  const shadow = '[text-shadow:0_1px_8px_rgba(26,26,28,0.7)]'

  return (
    <>
      <Preloader loading={loading} />

      <section
        id={sectionId}
        data-nav-theme="dark"
        aria-label="Hero"
        className="relative min-h-[100svh] w-full overflow-hidden bg-wet-petroleum lg:h-full lg:min-h-0"
      >
        {/* Full-bleed background (upgrade to MP4 when supplied) */}
        <Image
          src={assets.hero.background}
          alt={c.bgAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Mobile: centred name + descriptor on three lines */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={loading ? 'hidden' : 'visible'}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center lg:hidden"
        >
          <motion.h1
            variants={fadeInUp}
            className={`mb-5 font-copperplate text-[clamp(28px,7.5vw,46px)] leading-[1.1] tracking-[0.08em] text-bone-porcelain ${shadow}`}
          >
            {c.name}
          </motion.h1>
          {descParts.map((part, i) => (
            <motion.p
              key={i}
              variants={fadeInUp}
              className={`font-descriptor text-[12px] uppercase tracking-[0.30em] text-bone-porcelain ${i > 0 ? 'mt-1.5' : ''} ${shadow}`}
            >
              {part}
            </motion.p>
          ))}
        </motion.div>

        {/* Desktop: off-axis, bottom-left. Gated on preloader completion. */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={loading ? 'hidden' : 'visible'}
          className="absolute bottom-14 left-[52px] z-10 hidden lg:block"
        >
          <motion.div variants={fadeInUp} className="mb-[18px] h-px w-8 bg-synthetic-flesh/45" />
          <motion.h1
            variants={fadeInUp}
            className={`mb-[14px] font-copperplate text-[clamp(24px,3.4vw,50px)] leading-[1.1] tracking-[0.08em] text-bone-porcelain ${shadow}`}
          >
            {c.name}
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className={`font-descriptor text-[12px] uppercase tracking-[0.34em] text-bone-porcelain ${shadow}`}
          >
            {c.descriptor}
          </motion.p>
        </motion.div>

        {/* Scroll indicator — bottom-right, with a light travelling down the line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loading ? 0 : 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="absolute bottom-14 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-[10px] lg:left-auto lg:right-[52px] lg:translate-x-0"
        >
          <span className="vertical-text text-[12px] uppercase tracking-[0.30em] text-bone-porcelain/75 [text-shadow:0_1px_8px_rgba(26,26,28,0.7)]">
            {c.scroll}
          </span>
          <ShimmerLine tone="light" className="h-16" />
        </motion.div>
      </section>
    </>
  )
}
