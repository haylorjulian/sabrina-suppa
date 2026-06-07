'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { assets } from '@/lib/assets'
import { useLanguage } from '@/hooks/useLanguage'
import { usePreloader } from '@/hooks/usePreloader'
import { staggerContainer, fadeInUp } from '@/lib/animations'
import Preloader from '@/components/ui/Preloader'

export default function Hero() {
  const { t } = useLanguage()
  const { loading } = usePreloader()
  const c = t.hero

  return (
    <>
      <Preloader loading={loading} />

      <section
        id="home"
        data-nav-theme="dark"
        aria-label="Hero"
        className="relative h-screen min-h-[600px] w-full overflow-hidden bg-wet-petroleum"
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
        {/* Tonal overlay (mockup linear-gradient, token-approximated) */}
        <div className="absolute inset-0 bg-gradient-to-br from-oxidized-graphite/55 via-wet-petroleum/10 to-oxidized-graphite/75" />

        {/* Text block — off-axis, bottom-left. Gated on preloader completion. */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={loading ? 'hidden' : 'visible'}
          className="absolute bottom-14 left-6 z-10 md:left-[52px]"
        >
          <motion.div variants={fadeInUp} className="mb-[18px] h-px w-8 bg-synthetic-flesh/45" />
          <motion.h1
            variants={fadeInUp}
            className="mb-[14px] text-[clamp(28px,3.8vw,58px)] font-extralight italic leading-[1.05] tracking-[0.08em] text-bone-porcelain"
          >
            {c.name}
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-[10px] uppercase tracking-[0.32em] text-synthetic-flesh/85"
          >
            {c.descriptor}
          </motion.p>
        </motion.div>

        {/* Scroll indicator — bottom-right */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loading ? 0 : 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="absolute bottom-14 right-6 z-10 flex flex-col items-center gap-[10px] md:right-[52px]"
        >
          <span className="vertical-text text-[9px] uppercase tracking-[0.28em] text-bone-porcelain/30">
            {c.scroll}
          </span>
          <span className="h-12 w-px bg-gradient-to-b from-bone-porcelain/25 to-transparent" />
        </motion.div>
      </section>
    </>
  )
}
