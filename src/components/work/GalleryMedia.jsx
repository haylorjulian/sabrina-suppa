'use client'

import { motion } from 'framer-motion'
import { imageReveal } from '@/lib/animations'

// One justified-grid item — image or video — shown uncropped at its native aspect
// ratio. The figure is a flex item whose width comes from the aspect ratio:
//   flex-grow: ar    → within a row, space is shared ∝ aspect, so every image in
//                      the row settles to the same height and the row fills width.
//   flex-shrink: 0   → never shrink below basis; the next item wraps instead.
//   flex-basis: ar × rowBase → sets the baseline size; per-row count falls out of
//                      viewport ÷ basis (dynamic with screen width).
//   max-width: 100%  → a lone item on a narrow screen caps to the viewport.
// Intrinsic width/height (from the build-time dimension manifest) stay as
// attributes so the browser reserves space before the asset loads.
export default function GalleryMedia({ item, alt, rowBase = 360 }) {
  const { type, src, width, height } = item
  const ar = width && height ? width / height : 0.8
  const mediaCls = 'block h-auto w-full'

  return (
    <motion.figure
      variants={imageReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-8% 0px' }}
      style={{ flexGrow: ar, flexShrink: 0, flexBasis: `${ar * rowBase}px`, maxWidth: '100%' }}
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
    </motion.figure>
  )
}
