'use client'

import { motion } from 'framer-motion'
import { imageReveal } from '@/lib/animations'

// One justified-row cell — image or video — shown uncropped at its native aspect
// ratio. ProjectGallery computes each item's display width (so every item in a
// row shares the same height); the media fills that width and its height follows
// the aspect ratio. Intrinsic width/height stay as attributes so the browser
// reserves space before the asset loads. Soft reveal on scroll into view.
export default function GalleryMedia({ item, alt, displayWidth }) {
  const { type, src, width, height } = item
  const mediaCls = 'block h-auto w-full'

  return (
    <motion.figure
      variants={imageReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-8% 0px' }}
      style={{ width: displayWidth }}
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
