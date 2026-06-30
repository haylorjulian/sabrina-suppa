'use client'

import { useLayoutEffect, useRef, useState } from 'react'

// Sizes itself via the passed `className` (the fixed box) and uniformly scales
// its children down so they always fit — no scrolling, no clipping. Used for the
// Work category panel, where the box is a fixed fraction of the right side and
// the (variable-length) content must fit within it.
export default function FitBox({ children, className = '' }) {
  const boxRef = useRef(null)
  const contentRef = useRef(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const box = boxRef.current
    const content = contentRef.current
    if (!box || !content) return

    const fit = () => {
      // Measure the content at its natural size (ignore the current scale).
      const prev = content.style.transform
      content.style.transform = 'none'
      const k = Math.min(
        1,
        box.clientWidth / content.scrollWidth,
        box.clientHeight / content.scrollHeight
      )
      content.style.transform = prev
      setScale(k)
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    ro.observe(content) // re-fit when the content changes (e.g. category switch)
    if (document.fonts?.ready) document.fonts.ready.then(fit)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={boxRef} className={`flex items-center justify-center overflow-hidden ${className}`}>
      <div
        ref={contentRef}
        style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
        className="w-full"
      >
        {children}
      </div>
    </div>
  )
}
