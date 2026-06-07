'use client'

import { useState, useEffect } from 'react'

// Reproduces the About mockup's vertical blur segmentation: the image is sharp
// on the left and progressively blurs toward the right. Band count scales with
// viewport (3 / 5 / 7 / 10), matching the mockup breakpoints. Returns an ordered
// array of bands with left%, width% and blur px (first band stays sharp).
function bandCountFor(width) {
  if (width >= 1440) return 10
  if (width >= 1024) return 7
  if (width >= 768) return 5
  return 3
}

export function useBlurBands(maxBlur = 9) {
  const [count, setCount] = useState(3)

  useEffect(() => {
    const update = () => setCount(bandCountFor(window.innerWidth))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const step = 100 / count
  const blurStep = maxBlur / (count - 1)

  const bands = Array.from({ length: count }, (_, i) => ({
    left: step * i,
    width: step,
    blur: i === 0 ? 0 : +(blurStep * i).toFixed(2),
    showDivider: i > 0,
  }))

  return bands
}
