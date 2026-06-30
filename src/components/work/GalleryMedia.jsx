'use client'

import { motion } from 'framer-motion'
import { imageReveal } from '@/lib/animations'

// One gallery item — image or video — shown uncropped at its native aspect ratio.
// Intrinsic width/height (from the build-time dimension manifest) are set as
// attributes so the browser reserves layout space before the asset loads.
// `maxH` caps height (these assets are portrait-heavy); `align` shifts the piece
// within its column for editorial asymmetry. Reveals softly on scroll into view.
const ALIGN = {
  center: 'mx-auto',
  start: 'mr-auto',
  end: 'ml-auto',
}

export default function GalleryMedia({
  item,
  alt,
  index,
  total,
  maxH = 'max-h-[78vh]',
  align = 'center',
}) {
  const { type, src, width, height } = item
  const mediaCls = `block w-auto max-w-full object-contain ${maxH}`
  const num = String(index + 1).padStart(2, '0')

  return (
    <motion.figure
      variants={imageReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-12% 0px' }}
      className={`w-fit ${ALIGN[align] || ALIGN.center}`}
    >
      {type === 'video' ? (
        <video
          src={src}
          width={width || undefined}
          height={height || undefined}
          autoPlay
          muted
          loop
          playsInline
          aria-label={alt}
          className={mediaCls}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          width={width || undefined}
          height={height || undefined}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={mediaCls}
        />
      )}
      <figcaption className="mt-3 text-[10px] uppercase tracking-[0.3em] text-bone-porcelain/35">
        {num} <span className="text-bone-porcelain/20">/</span> {String(total).padStart(2, '0')}
      </figcaption>
    </motion.figure>
  )
}
