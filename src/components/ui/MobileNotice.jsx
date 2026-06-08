import Image from 'next/image'
import { assets } from '@/lib/assets'
import copy from '@/content/copy.json'

const t = copy.en
const shadow = '[text-shadow:0_1px_10px_rgba(26,26,28,0.85)]'

// Shown on phones and tablets (below lg) instead of the full site.
export default function MobileNotice() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-8 text-center lg:hidden">
      <Image
        src={assets.hero.background}
        alt={t.hero.bgAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Light scrim so the message stays legible over the image */}
      <div className="absolute inset-0 bg-oxidized-graphite/45" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <span className={`text-3xl font-extralight italic tracking-[0.08em] text-bone-porcelain ${shadow}`}>
          {t.hero.name}
        </span>
        <p className={`max-w-xs text-[13px] uppercase leading-[1.9] tracking-[0.18em] text-bone-porcelain/90 ${shadow}`}>
          {t.mobileNotice}
        </p>
      </div>
    </div>
  )
}
